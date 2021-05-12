import {observable, action} from 'mobx-miniprogram'
import {defaultState} from "./defaultState";
import {getState} from "./storage";

export const store = observable({
    ...defaultState,

    setFilters: action(function (pid, filters) {
        this.filters = {...this.filters, ...{[pid]: filters}}
    }),

    setCurrentEntity: action(function (did) {
        if (did) {
            this.currentEntity = this.entities[did] ? JSON.parse(JSON.stringify(this.entities[did])) : {}
            delete this.currentEntity._completed
        } else {
            this.currentEntity = {}
        }
    }),

    updateCurrentEntity: action(function (updates) {
        const current = this.currentEntity || {}
        this.currentEntity = {
            ...current, ...updates
        }
    }),

    addOrUpdateEntities: action(function (entities, pid) {
        if (!entities) {
            return
        }
        entities.forEach(entity => {
            const {did} = entity
            const old = this.entities[did]
            if (old) {
                this.entities[did] = {...old, ...entity, pid}
            } else {
                this.entities[did] = {...entity, pid}
            }
        })
        //莫名其妙
        this.entities = {...this.entities}
    }),

    queryVtByFilterSuccess: action(function (pid, filterID, total, entities, refresh) {
        const dids = []

        entities.forEach(entity => {
            const {did} = entity
            const old = this.entities[did]
            if (old) {
                this.entities[did] = {...old, ...entity, pid}
            } else {
                this.entities[did] = {...entity, pid}
            }
            dids.push(did)
        })

        const listUnderFilter = this.listByFilter[filterID] ? {...this.listByFilter[filterID]} : {}
        listUnderFilter.total = total

        //如果是刷新 这直接替换当前的list
        const oldList = refresh ? [] : (listUnderFilter.list || [])

        listUnderFilter.list = Array.from(new Set([...oldList, ...dids]))

        this.listByFilter = {...this.listByFilter, ...{[filterID]: listUnderFilter}}
    }),

    updateEntityAndVtConfig: action(function ({data: entity, vtconfig: vtConfig}) {
        const {did} = entity
        const {pid} = vtConfig
        const oldEntity = this.entities[did]
        const newEntity = {...oldEntity, ...entity, ...{'_completed': true}, pid}

        this.entities = {
            ...this.entities, ...{[did]: newEntity}
        }
        this.vtConfig = {
            ...this.vtConfig, ...{[vtConfig.pid]: vtConfig}
        }
    }),
    updateEntityByID: action(function (id, parts) {
        const oldEntity = this.entities[id]
        const newEntity = {...oldEntity, ...parts}
        this.entities = {
            ...this.entities, ...{[id]: newEntity}
        }
    }),

    updateVtConfig: action(function (vtConfig) {
        this.vtConfig = {
            ...this.vtConfig, ...{[vtConfig.pid]: vtConfig}
        }
    }),

    clearFilterByPid: action(function (pid) {
        if (!this.filters[pid]) {
            return
        }
        const filterIDs = this.filters[pid].map(filter => filter.did)
        const empty = filterIDs.reduce((obj, id) => {
            obj[id] = null
            return obj
        }, {})
        this.listByFilter = {...this.listByFilter, ...empty}
    }),

    setMyList: action(function (list) {
        this.myList = list
    }),

    reset: action(function () {
        const clone = JSON.parse(JSON.stringify(defaultState))
        Object.assign(this, clone)
    }),

    restore: action(function () {
        const state = getState()
        if (state) {
            Object.assign(this, state)
        }
    }),

    clearQueryConditions: action(function () {
        this.queryConditions = null
    }),

    updateQueryConditions: action(function (conditions, pid) {
        const current = this.queryConditions || {}
        if (conditions && Object.keys(conditions).length > 0) {
            this.queryConditions = {...current, ...conditions}

            if (pid) {
                const vtConfig = getVtConfigByPid(pid)
                const history = []
                const currentHistory = this.historyConditions || []
                Object.keys(conditions).forEach(key => {
                    const {type, spec} = vtConfig.columns.find(({column}) => column === key)
                    let exists = currentHistory.find((item) => item.key === key && item.value === conditions[key])
                    if (!exists && type === 'string') {
                        history.push({
                            key, value: conditions[key]
                        })
                    }
                })

                this.historyConditions = [...history, ...currentHistory]
            }

        }


    }),

    deleteQueryConditionByKey: action(function (key) {
        if (this.queryConditions) {
            const copy = {...this.queryConditions}
            delete copy[key]
            this.queryConditions = copy
        }
    }),

    clearQueryHistory: action(function () {
        this.historyConditions = null
    }),

    setLastVisitorApplyRecord: action(function (record) {
        this.lastVisitorApplyRecord = record
    })
})

export function getCurrentEntity() {
    return store.currentEntity
}

export function isEntityCompleted(entity) {
    return entity && entity['_completed']
}

export function getEntityByID(id) {
    return store.entities[id]
}

export function getEntityByIDs(ids) {
    return ids.map(id => store.entities[id])
}

export function getFiltersByPID(pid) {
    return store.filters[pid]
}

export function getVtConfigByPid(pid) {
    return store.vtConfig[pid]
}

export function getQueryConditions() {
    return store.queryConditions
}