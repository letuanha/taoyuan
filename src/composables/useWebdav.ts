import { ref, computed } from 'vue'
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { parseSaveData } from '@/stores/useSaveStore'

const STORAGE_KEY = 'taoyuanxiang_webdav'
const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const MAX_SLOTS = 3

export interface WebdavConfig {
  enabled: boolean
  serverUrl: string
  path: string
  username: string
  password: string
}

const defaultConfig = (): WebdavConfig => ({
  enabled: false,
  serverUrl: '',
  path: '',
  username: '',
  password: ''
})

const loadConfig = (): WebdavConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultConfig(), ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return defaultConfig()
}

/** 持久化配置 */
const config = ref<WebdavConfig>(loadConfig())
const testStatus = ref<'idle' | 'testing' | 'success' | 'failed'>('idle')
const testError = ref('')
const traceLogs = ref<string[]>([])
const TRACE_LOG_LIMIT = 80

/** 检测是否在 Electron 环境中 */
const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')

/** 当前时间（HH:mm:ss） */
const nowLabel = (): string => {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/** WebDAV 调试日志（用于安卓环境排查，避免依赖 console） */
const pushTrace = (msg: string) => {
  traceLogs.value.push(`[${nowLabel()}] ${msg}`)
  if (traceLogs.value.length > TRACE_LOG_LIMIT) {
    traceLogs.value.splice(0, traceLogs.value.length - TRACE_LOG_LIMIT)
  }
}

const clearTrace = () => {
  traceLogs.value = []
}

const formatUrlForLog = (url: string): string => {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`
  } catch {
    return url
  }
}

const extractErrorMessage = (e: unknown): string => {
  if (e instanceof Error && e.message) return e.message
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const message = (e as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
    try {
      return JSON.stringify(e)
    } catch {
      return String(e)
    }
  }
  return String(e)
}

const normalizeUserError = (msg: string): string => {
  // 安卓原生 HttpURLConnection 在部分失败分支只返回 URL 文本，可读性很差
  if (/^https?:\/\//i.test(msg.trim())) {
    return 'Yêu cầu thất bại (máy chủ từ chối hoặc đường dẫn không tồn tại)'
  }
  return msg
}

/** 平台自适应 HTTP 请求：原生平台走 CapacitorHttp，dev 走 Vite 代理，Electron/生产 web 直连 */
const webdavFetch = async (
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; data: string }> => {
  const logUrl = formatUrlForLog(url)
  pushTrace(`Yêu cầu ${method} ${logUrl}`)
  try {
    // 原生平台（Capacitor Android/iOS）：CapacitorHttp 绕过 CORS
    if (Capacitor.isNativePlatform()) {
      const res = await CapacitorHttp.request({
        url,
        method,
        headers,
        data: body
      })
      pushTrace(`Phản hồi ${method} ${res.status}`)
      return {
        status: res.status,
        data: typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      }
    }
    // Dev 环境（非 Electron）：走 Vite 代理中间件绕过 CORS
    if (import.meta.env.DEV && !isElectron) {
      const res = await fetch('/__webdav', {
        method,
        headers: { ...headers, 'x-webdav-url': url },
        body
      })
      pushTrace(`Phản hồi ${method} ${res.status}`)
      return { status: res.status, data: await res.text() }
    }
    // Electron（主进程已注入 CORS 头）/ 生产 web（同源部署）：直连
    // credentials: 'omit' 防止浏览器弹出原生认证对话框（认证由 Authorization 头自行处理）
    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: 'omit'
    })
    pushTrace(`Phản hồi ${method} ${res.status}`)
    return { status: res.status, data: await res.text() }
  } catch (e: unknown) {
    const msg = extractErrorMessage(e)
    pushTrace(`Ngoại lệ ${method} ${msg}`)
    throw e
  }
}

/** 根据 serverUrl 域名返回针对性的路径提示 */
const getPathHint = (serverUrl: string): string => {
  try {
    const host = new URL(serverUrl).hostname.toLowerCase()
    if (host.includes('jianguoyun')) return 'Jianguoyun: hãy nhập tên thư mục đã tồn tại vào 「Đường dẫn lưu trữ」, ví dụ "Jianguoyun của tôi".'
    if (host.includes('nextcloud') || serverUrl.includes('/remote.php/dav')) return 'Nextcloud: hãy nhập tên thư mục đích vào 「Đường dẫn lưu trữ」.'
    if (host.includes('owncloud') || serverUrl.includes('/remote.php/webdav')) return 'ownCloud: hãy nhập tên thư mục đích vào 「Đường dẫn lưu trữ」.'
  } catch {
    /* ignore */
  }
  return 'Hãy nhập tên một thư mục đã tồn tại vào 「Đường dẫn lưu trữ」.'
}

export const useWebdav = () => {
  const webdavConfig = config
  const webdavTestStatus = testStatus
  const webdavTestError = testError

  const webdavReady = computed(() => config.value.enabled && testStatus.value === 'success')

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  }

  /** 确保 URL 末尾带 / */
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim().replace(/\/+$/, '')
    return trimmed ? trimmed + '/' : ''
  }

  /** 拼接 serverUrl + path 得到完整目录 URL（对路径段做 percent-encode 以支持中文） */
  const fullDirUrl = (): string => {
    const base = normalizeUrl(config.value.serverUrl)
    const sub = config.value.path.trim().replace(/^\/+|\/+$/g, '')
    if (!sub) return base
    const encoded = sub
      .split('/')
      .map(s => encodeURIComponent(s))
      .join('/')
    return base + encoded + '/'
  }

  /** 生成 Basic Auth header */
  const authHeaders = (): Record<string, string> => ({
    Authorization: 'Basic ' + btoa(config.value.username + ':' + config.value.password)
  })

  /** 远程文件路径 */
  const remoteFilePath = (slot: number): string => fullDirUrl() + `taoyuan_save_${slot}.tyx`

  /** 根据状态码设置测试错误提示 */
  const setTestErrorByStatus = (status: number, phase?: string) => {
    const prefix = phase ? `${phase}：` : ''
    if (status === 401 || status === 403) {
      testError.value = prefix + 'Xác thực thất bại, hãy kiểm tra tên người dùng và mật khẩu'
    } else if (status === 404 || status === 409) {
      testError.value = prefix + 'Đường dẫn không tồn tại.' + getPathHint(config.value.serverUrl)
    } else if (status === 405 || status === 501) {
      testError.value = prefix + 'Máy chủ không hỗ trợ thao tác WebDAV hiện tại'
    } else {
      testError.value = prefix + `Máy chủ trả về ${status}`
    }
    pushTrace(`Kiểm tra thất bại ${prefix}${status}`)
  }

  /** 原生平台连接探测：尝试 PUT 临时文件并在成功后 DELETE */
  const probeNativeWritable = async (dirUrl: string): Promise<{ status: number; error: string }> => {
    // 避免使用点前缀隐藏文件名，一些 WebDAV 服务会拒绝该类文件
    const probeUrl = dirUrl + `taoyuan_probe_${Date.now()}.tyx`
    pushTrace('Kiểm tra gốc: thử PUT tệp tạm')
    try {
      const putRes = await webdavFetch(
        probeUrl,
        'PUT',
        {
          ...authHeaders(),
          'Content-Type': 'application/octet-stream'
        },
        'probe'
      )
      if (putRes.status >= 200 && putRes.status < 300) {
        try {
          pushTrace('Kiểm tra gốc: PUT thành công, thử DELETE tệp tạm')
          await webdavFetch(probeUrl, 'DELETE', authHeaders())
        } catch {
          /* 忽略清理失败，避免影响测试结果 */
          pushTrace('Kiểm tra gốc: DELETE dọn dẹp thất bại (bỏ qua)')
        }
      }
      return { status: putRes.status, error: '' }
    } catch (e: unknown) {
      const msg = normalizeUserError(extractErrorMessage(e))
      pushTrace(`Kiểm tra gốc gặp lỗi: ${msg}`)
      return { status: 0, error: msg }
    }
  }

  /** 测试连接：Web/Electron 优先 PROPFIND；原生平台先 HEAD，失败后 fallback 到 PUT+DELETE 探测 */
  const testConnection = async (): Promise<boolean> => {
    clearTrace()
    testStatus.value = 'testing'
    testError.value = ''
    pushTrace(`Bắt đầu kiểm tra kết nối (platform=${Capacitor.getPlatform()})`)
    try {
      const base = normalizeUrl(config.value.serverUrl)
      if (!base) {
        testStatus.value = 'failed'
        testError.value = 'Địa chỉ máy chủ trống'
        pushTrace('Thất bại: địa chỉ máy chủ trống')
        return false
      }
      const url = fullDirUrl()
      const isNative = Capacitor.isNativePlatform()
      pushTrace(`Thư mục đích ${formatUrlForLog(url)}`)

      if (!isNative) {
        pushTrace('Chiến lược: PROPFIND kiểm tra thư mục')
        const res = await webdavFetch(url, 'PROPFIND', {
          ...authHeaders(),
          Depth: '0'
        })
        // 大多数 WebDAV 返回 207，部分实现可能返回 200
        if (res.status === 207 || res.status === 200) {
          testStatus.value = 'success'
          pushTrace('Kiểm tra thành công')
          return true
        }
        testStatus.value = 'failed'
        setTestErrorByStatus(res.status, 'PROPFIND')
        return false
      }

      // 原生平台跳过 HEAD：Android 上 HEAD 失败时常只抛 URL 文本异常，无法稳定拿到状态码
      pushTrace('Chiến lược: PUT kiểm tra quyền ghi thư mục (Android bỏ qua HEAD)')
      const probe = await probeNativeWritable(url)
      if (probe.status >= 200 && probe.status < 300) {
        testStatus.value = 'success'
        pushTrace('Kiểm tra thành công (thăm dò PUT)')
        return true
      }

      if (probe.status > 0) {
        testStatus.value = 'failed'
        setTestErrorByStatus(probe.status, 'PUT')
        return false
      }

      testStatus.value = 'failed'
      testError.value = probe.error || 'Kết nối thất bại (lỗi kiểm tra PUT)'
      pushTrace(testError.value)
      return false
    } catch (e: unknown) {
      testStatus.value = 'failed'
      const msg = normalizeUserError(extractErrorMessage(e))
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
        testError.value = 'Lỗi mạng, hãy kiểm tra địa chỉ có chính xác không'
      } else {
        testError.value = msg || 'Kết nối thất bại'
      }
      pushTrace(`Lỗi bất thường: ${testError.value}`)
      return false
    }
  }

  /** 确保远程目录存在（MKCOL），已存在时 405/409 属正常情况 */
  const ensureDirectory = async (): Promise<void> => {
    // CapacitorHttp 基于 HttpURLConnection，不支持 MKCOL
    if (Capacitor.isNativePlatform()) {
      pushTrace('Bỏ qua MKCOL: nền tảng gốc không hỗ trợ')
      return
    }
    const url = fullDirUrl()
    if (!url) return
    try {
      pushTrace('Thử MKCOL để tạo thư mục')
      await webdavFetch(url, 'MKCOL', authHeaders())
    } catch {
      /* 忽略：目录创建失败不阻塞上传流程 */
      pushTrace('MKCOL thất bại (bỏ qua)')
    }
  }

  /** 上传存档到 WebDAV */
  const uploadSave = async (slot: number): Promise<{ success: boolean; message: string }> => {
    pushTrace(`Bắt đầu tải lên slot=${slot}`)
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return { success: false, message: 'Không có bản lưu cục bộ.' }
    try {
      let res = await webdavFetch(
        remoteFilePath(slot),
        'PUT',
        {
          ...authHeaders(),
          'Content-Type': 'application/octet-stream'
        },
        raw
      )
      // 404 通常是远程目录不存在，Web/Electron 端尝试 MKCOL 创建后重试
      if (res.status === 404 && !Capacitor.isNativePlatform()) {
        await ensureDirectory()
        res = await webdavFetch(
          remoteFilePath(slot),
          'PUT',
          {
            ...authHeaders(),
            'Content-Type': 'application/octet-stream'
          },
          raw
        )
      }
      if (res.status >= 200 && res.status < 300) {
        pushTrace(`Tải lên thành công slot=${slot}`)
        return { success: true, message: `Bản lưu ${slot + 1} đã được tải lên đám mây.` }
      }
      if (Capacitor.isNativePlatform() && (res.status === 404 || res.status === 409)) {
        return {
          success: false,
          message: 'Đường dẫn tải lên không hợp lệ. Android không hỗ trợ tự tạo thư mục, hãy tạo thư mục trước trên ổ đám mây.' + getPathHint(config.value.serverUrl)
        }
      }
      if (res.status === 404) {
        return {
          success: false,
          message: 'Đường dẫn tải lên không hợp lệ.' + getPathHint(config.value.serverUrl)
        }
      }
      pushTrace(`Tải lên thất bại slot=${slot} status=${res.status}`)
      return { success: false, message: `Tải lên thất bại (${res.status}).` }
    } catch (e: unknown) {
      const msg = normalizeUserError(extractErrorMessage(e))
      pushTrace(`Lỗi tải lên slot=${slot} ${msg}`)
      return { success: false, message: `Tải lên thất bại: ${msg}` }
    }
  }

  /** 从 WebDAV 下载存档 */
  const downloadSave = async (slot: number): Promise<{ success: boolean; message: string }> => {
    pushTrace(`Bắt đầu tải xuống slot=${slot}`)
    try {
      const res = await webdavFetch(remoteFilePath(slot), 'GET', authHeaders())
      if (res.status === 404) {
        return { success: false, message: `Không có bản lưu ${slot + 1} trên đám mây.` }
      }
      if (res.status < 200 || res.status >= 300) {
        return { success: false, message: `Tải xuống thất bại (${res.status}).` }
      }
      if (!parseSaveData(res.data)) {
        return { success: false, message: 'Dữ liệu bản lưu trên đám mây không hợp lệ hoặc đã hỏng.' }
      }
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, res.data)
      pushTrace(`Tải xuống thành công slot=${slot}`)
      return { success: true, message: `Bản lưu ${slot + 1} đã được tải xuống từ đám mây.` }
    } catch (e: unknown) {
      const msg = normalizeUserError(extractErrorMessage(e))
      pushTrace(`Lỗi tải xuống slot=${slot} ${msg}`)
      return { success: false, message: `Tải xuống thất bại: ${msg}` }
    }
  }

  /** 列出远程存档是否存在 */
  const listRemoteSaves = async (): Promise<{ slot: number; exists: boolean }[]> => {
    pushTrace('Bắt đầu liệt kê bản lưu từ xa')
    const results: { slot: number; exists: boolean }[] = []
    const isNative = Capacitor.isNativePlatform()
    for (let i = 0; i < MAX_SLOTS; i++) {
      try {
        // 一些 WebDAV 服务对 HEAD 支持不完整，原生平台改用 GET 判断文件存在
        const method = isNative ? 'GET' : 'HEAD'
        const res = await webdavFetch(remoteFilePath(i), method, authHeaders())
        pushTrace(`Slot từ xa ${i} status=${res.status}`)
        results.push({
          slot: i,
          exists: res.status >= 200 && res.status < 300
        })
      } catch {
        pushTrace(`Slot từ xa ${i} yêu cầu gặp lỗi`)
        results.push({ slot: i, exists: false })
      }
    }
    return results
  }

  return {
    webdavConfig,
    webdavTestStatus,
    webdavTestError,
    webdavTraceLogs: traceLogs,
    webdavReady,
    saveConfig,
    clearTrace,
    testConnection,
    uploadSave,
    downloadSave,
    listRemoteSaves
  }
}
