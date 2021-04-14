# node-mock-server

[![Node](https://img.shields.io/badge/-NodeJS-%23F05032?style=for-the-badge&logo=Node.js&logoColor=%235d9558&color=%232d2d2d)](https://github.com/MYWProgram/node-mock-server)
[![Nodemon](https://img.shields.io/badge/-Nodemon-%23F05032?style=for-the-badge&logo=Nodemon&logoColor=%235d9558&color=%232d2d2d)](https://github.com/MYWProgram/node-mock-server)

使用`node.js`-`koa2`构建，`lowdb`持久化JSON数据的`mock`工具；用于应对日常开发前端`mock`实现

## Version

[![Node](https://img.shields.io/badge/Node.js-%3E10.14.3-green)](https://github.com/MYWProgram/node-mock-server)

## 功能

1. 包含了`jwt`实现的登录登出
2. 实现接口`token`验证
3. 内部引入`mock.js`快速生成所需数据
4. 包含了`socket`实时通讯接口实现
5. 基于`RBAC`实现了简易的接口代码生成器

完全可以模拟真实后段业务逻辑

## 使用

1. npm(yarn) install
2. npm run(yarn) start
3. `config.js`中配置IP及端口号

## 生成代码

修改`template/config/model.js`代码，使用`nunjucks`配置了简单的代码生成器：

> npm run(yarn) code

## 自定义接口

参考`src`中已存在文件：

- `src/routes`路由文件

路由配置中，每个接口被访问时，会调用对用的`controller`的方法：

```js
.post('/auth/login', controllers.auth.login)
```

- `src/controllers`控制器文件

引入相应的实体服务：

```js
import menuService from '../services/memuService'
import roleService from '../services/roleService'
```

调用服务方法完成功能需求：

```js
export const getMenuFunctions = async (ctx) => {
  let menuId = ctx.query.menuId
  let roleId = ctx.query.roleId
  let [menuFunctions, roleFunctions] =
    await Promise.all([menuService.getMenuFunctions(menuId), roleService.getRoleFunctions(roleId)])
  return responseTemplate.success(ctx, {
    menuFunctions: menuFunctions,
    roleFunctions: roleFunctions
  })
}
```

- `src/services`服务文件

引入相应的`model`或其他服务：

```js
import model from '../models/baseModel'
import roleService from './roleService'
import functionService from './functionService'
```

- `src/models`model文件，读取JSON数据

使用`lowdb`读取相应的JSON文件获取数据：

```js
import path from 'path'

const low = require('lowdb')
const lodashId = require('lodash-id')
const FileAsync = require('lowdb/adapters/FileAsync')
const dbFile = path.join(__dirname, '../db/book_db.json')
const adapter = new FileAsync(dbFile)
let instance = undefined
module.exports = {
  init: function (context) {
    return new Promise((resolve, reject) => {
      if (instance === undefined) {
        low(adapter).then(db => {
          db._.mixin(lodashId)
          instance = db;
          resolve(db.get(context))
        })
      } else {
        resolve(instance.get(context))
      }
    })
  },
  read: () => {
    return new Promise((resolve, reject) => {
      if (instance === undefined) {
        resolve()
      }
      else {
        instance.read().then(() => {
          resolve()
        })
      }
    })
  }
}
```

- `src/db`中持久化数据

### 接口权限

- 如需去掉权限配置，直接注释`src/app.js`:

```js
.use(jwt({ secret: publicKey }).unless({ path: [/^\/public|\/auth\/login|\/assets/] }))
```

- 如需部分接口去掉权限，修改`.unless()`中正则匹配即可
