# 旅游日记平台-审核管理-web端

## 项目简介
这是一个基于 React 框架开发的旅游日记平台前端审核管理系统，提供多角色登录、游记审核管理、状态筛选及逻辑删除等功能。

## 功能
- 多角色登录（审核人员、管理员）
- 游记列表展示与筛选
- 游记审核功能（通过/拒绝）
- 游记删除操作（管理员权限）
- 图片和视频预览

## 技术栈
- React 19
- React Router Dom
- Axios
- Ant Design 5.25

## 安装与运行

### 1. 克隆项目
```bash
git clone git@github.com:youduoshaoaikechonglai/travel_diary-web.git
```

### 2. 进入项目目录
```bash
cd travel_diary-web
```

### 3. 安装依赖
```bash
npm install
```

### 4. 开发环境运行
```bash
npm start
```

## 页面展示

### 登录页面
![登录页面](/public/登录页.png)

### 审核人员登录
![审核人员登录](/public/审核人员登录.png)

### 管理员登录
![管理员登录](/public/管理员登录.png)


## 接口
本项目需要与旅游日记平台后端服务配合使用，默认连接 `http://localhost:3001/api` 作为服务地址。主要接口包括： 

- `/api/admin/login` - 登录
- `/api/review/notes` - 获取游记列表
- `/api/review/action` - 审核操作（通过/拒绝）
- `/api/review/note/:id` - 游记删除操作

## 学习资源
- [React 中文文档](https://zh-hans.react.dev/)
- [Ant Design 组件库](https://ant.design/index-cn)
- [React Router 文档](https://reactrouter.com/)
