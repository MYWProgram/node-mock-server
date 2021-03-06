import _ from 'lodash'
import model from '../models/baseModel'
import roleService from './roleService'
const context = 'user'
const adminContext = 'admin'
const roleUserContext = 'roleUser'
const menuContext = 'menu'
module.exports = {
    getUserByNameAndPwd: async (name, pwd) => {
        let db = await model.init(context)
        let user = db.find({ name: name, password: pwd }).value()
        return user
    },
    getUserById: async (id) => {
        let db = await model.init(context)
        let user = db.find({ id: id }).value()
        return user
    },
    getUserList: async () => {
        let db = await model.init(context)
        let list = db.value()
        return list
    },
    getUserPagedList: async (pageIndex, pageSize, sortBy, descending, filter) => {
        let db = await model.init(context)
        let roleList = db.value()
        let resultList = JSON.parse(JSON.stringify(roleList))
        if (filter.name) {
            resultList = _.filter(resultList, (o) => {
                return o.name.indexOf(filter.name) > -1 || o.trueName.indexOf(filter.name) > -1
            });
        }
        if (filter.email) {
            resultList = _.filter(resultList, (o) => {
                return o.email.indexOf(filter.email) > -1
            });
        }
        if (filter.roleId) {
            let roleUserDb = await model.init(roleUserContext)
            let roleUserList = roleUserDb.filter({ roleId: filter.roleId }).value()
            roleUserList = roleUserList.map(s => {
                return s.userId
            })
            resultList = _.map(resultList, (item) => {
                if (roleUserList.indexOf(item.id) > -1) {
                    item.isAdd = 1
                } else {
                    item.isAdd = 2
                }
                return item
            })
            sortBy = "isAdd"
        }
        let totalCount = resultList.length
        if (sortBy) {
            resultList = _.sortBy(resultList, [sortBy])
            if (descending === 'true') {
                resultList = resultList.reverse()
            }
        }
        let start = (pageIndex - 1) * pageSize
        let end = pageIndex * pageSize
        resultList = _.slice(resultList, start, end)

        return {
            totalCount: totalCount,
            rows: resultList
        }

    },
    delUser: async (id) => {
        let db = await model.init(context)
        let adminDb = await model.init(adminContext)
        let admin = adminDb.value()
        if (admin.indexOf(id) > -1) {
            return {
                success: false,
                msg: "???????????????????????????"
            }
        }
        await db.remove({ id: id }).write()
        return {
            success: true,
            msg: ""
        }
    },
    saveUser: async (user) => {
        let db = await model.init(context)
        let exist = db.find({ name: user.name }).value()
        if (exist && exist.id != user.id) {
            return {
                success: false,
                msg: "????????????????????????"
            }
        }
        let exist1 = db.find({ email: user.email }).value()
        if (exist1 && exist1.id != user.id) {
            return {
                success: false,
                msg: "????????????????????????"
            }
        }
        if (user.id) {
            await db.find({ id: user.id })
                .assign(user)
                .write()
        } else {
            user.password = "123456"
            await db.insert(user).write()
        }
        return {
            success: true,
            msg: ""
        }
    },
    changePassWord: async (user) => {

    },
    editRoleUser: async (roleUser) => {
        let roleUserDb = await model.init(roleUserContext)
        if (roleUser.action == 1) {
            await roleUserDb.push({ userId: roleUser.userId, roleId: roleUser.roleId }).write()
        } else {
            await roleUserDb.remove({ userId: roleUser.userId, roleId: roleUser.roleId }).write()
        }
    },
    getUserRole: async (userId) => {
        let roleUserDb = await model.init(roleUserContext)
        let roleUserList = roleUserDb.filter({ userId: userId }).value()
        let roleIdList = roleUserList.map(s => {
            return s.roleId
        })
        let roleList = await roleService.getRoleListByIdList(roleIdList)
        let roleCodeList = roleList.map(s => {
            return s.code
        })
        return roleCodeList
    },
    getUserPermission: async (userId) => {
        let roleUserDb = await model.init(roleUserContext)
        let roleUserList = roleUserDb.filter({ userId: userId }).value()
        let roleIdList = roleUserList.map(s => {
            return s.roleId
        })
        let roleFunctions = await roleService.getRoleFuntionsByRoleIds(roleIdList)
        let functionIds = roleFunctions.map(s => {
            return s.functionId
        })
        let menudb = await model.init(menuContext)
        let menuList = menudb.value()
        menuList = menuList.filter(s => {
            return functionIds.indexOf(s.id) > -1
        })
        let functionCodeList = menuList.map(s => {
            return s.permission
        })
        functionCodeList = functionCodeList.filter(s => s)
        return functionCodeList
    },
    getUserFunctions: async (userId) => {
        let roleUserDb = await model.init(roleUserContext)
        let roleUserList = roleUserDb.filter({ userId: userId }).value()
        let roleIdList = roleUserList.map(s => {
            return s.roleId
        })
        let roleFunctions = await roleService.getRoleFuntionsByRoleIds(roleIdList)
        let functionIds = roleFunctions.map(s => {
            return s.functionId
        })
        let menudb = await model.init(menuContext)
        let menuList = menudb.value()
        let functionList = menuList.filter(s => {
            return functionIds.indexOf(s.id) > -1
        })
        return functionList;
    },
    isAdmin: async (userId) => {
        let adminDb = await model.init(adminContext)
        let admin = adminDb.value()
        if (admin.indexOf(userId) > -1) {
            return true
        }
        return false
    }
}