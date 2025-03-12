/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId() {
  // 生成随机字符串
  const randomStr = Math.random().toString(36).substring(2, 10);
  // 添加时间戳
  const timestamp = Date.now().toString(36);
  // 组合成唯一ID
  return `${timestamp}-${randomStr}`;
}
