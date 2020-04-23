<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>s

      <el-table-column width="120px" align="center" label="头像">
        <template slot-scope="scope">
          <div class="block"><el-avatar :size="50" :src="scope.row.avatar | avatarFilter" /></div>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="角色" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag v-for="role in scope.row.roles" :key="role" type="success">
            {{ role }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="视频">
        <template slot-scope="scope">
          <span>{{ scope.row.clipCount }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="粉丝">
        <template slot-scope="scope">
          <span>{{ scope.row.followerCount }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="关注">
        <template slot-scope="scope">
          <span>{{ scope.row.followerCount }}</span>
        </template>
      </el-table-column>

      <el-table-column label="封禁" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.locked===0" size="mini" type="danger" @click="handleLock(scope.row.id)">
            封禁
          </el-button>
          <el-button v-if="scope.row.locked===1" size="mini" type="success" @click="handleUnLock(scope.row.id)">
            解封
          </el-button>
        </template>
      </el-table-column>

    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { fetchUserList, lockUser, unlockUser } from '@/api/user'

export default {
  name: 'UserList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },

    avatarFilter(avatar) {
      return process.env.VUE_APP_BASE_AVATAR + avatar
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchUserList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
        console.log(this.list)
      })
    },
    handleLock(id) {
      lockUser({ 'id': id }).then(response => {
        this.$notify({
          title: '成功',
          message: '用户已封禁',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },

    handleUnLock(id) {
      unlockUser({ 'id': id }).then(response => {
        this.$notify({
          title: '成功',
          message: '用户已解封',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    }
  }
}
</script>

<style scoped>
  .edit-input {
    padding-right: 100px;
  }
  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>

