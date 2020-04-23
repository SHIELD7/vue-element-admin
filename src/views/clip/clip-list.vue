<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.creator" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in userList" :key="item.id" :label="item.username" :value="item.id" />
      </el-select>
      <el-select v-model="listQuery.deleted" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in isDeleted" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%" @sort-change="sortChange">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建日期" prop="id" sortable="custom" align="center" width="150" :class-name="getSortClass('create_time')">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="作者">
        <template slot-scope="scope">
          <span>{{ scope.row.user.username }}</span>
        </template>
      </el-table-column>

      <el-table-column width="300px" label="标题">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.title" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row, index)"
            >
              取消
            </el-button>
          </template>
          <span v-else>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="300px" align="center" label="视频">
        <template slot-scope="scope">
          <video-player
            ref="videoPlayer"
            class="vjs-custom-skin"
            :options="scope.row.playerOptions"
          />
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="info">
            {{ scope.row.deleted|deletedFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="编辑" width="120">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row, index)"
          >
            确定
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.deleted===0" size="mini" type="danger" @click="handleDelete(scope.row.id,1)">
            删除
          </el-button>
          <el-button v-if="scope.row.deleted===1" size="mini" type="success" @click="handleDelete(scope.row.id,0)">
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { fetchList, updateClip } from '../../api/clip'
import { videoPlayer } from 'vue-videojs7'
import { fetchUserList } from '../../api/user'
export default {
  name: 'ClipList',
  components: { Pagination, videoPlayer },
  filters: {
    deletedFilter(deleted) {
      const deletedMap = {
        0: '已发布',
        1: '已删除'
      }
      return deletedMap[deleted]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        deleted: null,
        creator: null,
        orders: [{ 'column': 'create_time', 'asc': false }]
      },
      isDeleted: [{ 'key': 0, 'label': '已发布' }, { 'key': 1, 'label': '已删除' }],
      userList: null,
      sort: null
    }
  },
  created() {
    this.getUserList()
    this.getList()
  },
  methods: {
    handleFilter() {
      this.getList()
    },
    getUserList() {
      fetchUserList({ 'size': -1, 'current': 1 }).then(response => {
        this.userList = response.data.records
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
        for (let i = 0; i < this.list.length; i++) {
          const clipSrc = process.env.VUE_APP_BASE_CLIP + this.list[i].clipPath
          this.list[i].edit = false
          this.list[i].originalTitle = this.list[i].title
          this.list[i].playerOptions = {
            height: '180',
            autoplay: false,
            muted: true,
            language: 'zh-CN',
            playbackRates: [0.7, 1.0, 1.5, 2.0],
            sources: [{
              withCredentials: false,
              type: 'application/x-mpegURL',
              src: clipSrc
            }],
            controlBar: {
              timeDivider: true,
              durationDisplay: true,
              remainingTimeDisplay: false,
              fullscreenToggle: true // 全屏按钮
            },
            poster: process.env.VUE_APP_BASE_COVER + this.list[i].coverPath
          }
        }
      })
    },
    handleDelete(id, deleted) {
      updateClip({ 'id': id, 'deleted': deleted }).then(response => {
        let message
        if (deleted === 0) {
          message = '恢复成功'
        }
        if (deleted === 1) {
          message = '删除成功'
        }
        this.$notify({
          title: '成功',
          message: message,
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },

    cancelEdit(row, index) {
      row.title = row.originalTitle
      row.edit = false
      this.$set(this.list, index, row)
      this.$message({
        message: '取消编辑',
        type: 'warning'
      })
    },

    confirmEdit(row, index) {
      row.edit = false
      this.$set(this.list, index, row)
      updateClip({ 'id': row.id, 'title': row.title }).then(response => {
        this.$notify({
          title: '成功',
          message: '编辑成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    sortChange(data) {
      const { prop, order } = data
      console.log(prop)
      console.log(order)
      if (order === 'ascending') {
        this.listQuery.orders = [{ 'column': 'create_time', 'asc': true }]
      } else {
        this.listQuery.orders = [{ 'column': 'create_time', 'asc': false }]
      }
      this.getList()
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
