import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/api/clip/list-admin',
    method: 'post',
    data
  })
}
export function updateClip(data) {
  return request({
    url: '/api/clip/update',
    method: 'post',
    data
  })
}
