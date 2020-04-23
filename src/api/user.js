import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
    // params: { token }
  })
}

export function logout() {
  return request({
    url: '/api/user/logout',
    method: 'post'
  })
}

export function fetchUserList(data) {
  return request({
    url: '/api/user/list',
    method: 'post',
    data
  })
}

export function lockUser(data) {
  return request({
    url: '/api/user/lock',
    method: 'post',
    data
  })
}

export function unlockUser(data) {
  return request({
    url: '/api/user/unlock',
    method: 'post',
    data
  })
}
