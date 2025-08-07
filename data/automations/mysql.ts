import { getAuth, getServiceToken } from "protonode";
import { API, Protofy, getLogger } from "protobase";
import APIContext from "app/bundles/context";
import { Application } from 'express';
import fs from 'fs'
import path from "path";
import mysql from 'mysql2'
import { Db } from "@extensions/mysql/db";

const root = path.join(process.cwd(), '..', '..')
const logger = getLogger()
const name = "mysql"
const origin = 'automations'

Protofy("type", "CustomAPI")

async function dbCredentials(req, res, next) {
    try {
        // here we could also implement the db host, and more.
        let dbName = (await API.get("/api/core/v1/keys/DB_NAME?token=" + getServiceToken())).data;
        let dbUser = (await API.get("/api/core/v1/keys/DB_USER?token=" + getServiceToken())).data;
        let dbPassword = (await API.get("/api/core/v1/keys/DB_PASSWORD?token=" + getServiceToken())).data;

        if (!dbUser || !dbName || !dbPassword) {
            return res.json({
                is_error: true,
                error: "DB secrets no provided. Required: DB_NAME, DB_USER, DB_PASSWORD",
                data: null
            })
        }

        req.DB_NAME = dbName
        req.DB_USER = dbUser
        req.DB_PASSWORD = dbPassword
        next()
    } catch (err) {
        console.log(err)
        res.json({
            error: "-", // avoid giving to much information about the internal error
            is_error: true,
            data: null,
        })
    }
}

export default Protofy("code", async (app: Application, context) => {
    app.get("/api/v1/mysql/alive", dbCredentials, async (req, res) => {
        try {
            const { DB_NAME, DB_USER, DB_PASSWORD } = req as any // avoid type errors caused by express typing
            console.log({ DB_NAME, DB_USER, DB_PASSWORD })
            const db = new Db(DB_USER?.value, DB_PASSWORD?.value, DB_NAME?.value)
            const connected = await db.connect();
            if (!connected) {
                return res.json({
                    error: "-", // avoid giving to much information about the internal error
                    is_error: true,
                    data: null,
                })
            }
            await db.close()
            res.json({
                is_error: false,
                error: null,
                data: {}
            })
        } catch (err) {
            console.log(err)
            res.json({
                error: "-", // avoid giving to much information about the internal error
                is_error: true,
                data: null,
            })
        }
    })
    app.get("/api/v1/mysql/tables", dbCredentials, async (req, res) => {
        try {
            const { DB_NAME, DB_USER, DB_PASSWORD } = req as any // avoid type errors caused by express typing
            console.log({ DB_NAME, DB_USER, DB_PASSWORD })
            const db = new Db(DB_USER?.value, DB_PASSWORD?.value, DB_NAME?.value)
            const connected = await db.connect();
            if (!connected) {
                return res.json({
                    error: "-", // avoid giving to much information about the internal error
                    is_error: true,
                    data: null,
                })
            }
            let result = await db.getTables()
            await db.close()
            res.json({
                is_error: false,
                error: null,
                data: result
            })
        } catch (err) {
            console.log(err)
            res.json({
                error: "-", // avoid giving to much information about the internal error
                is_error: true,
                data: null,
            })
        }
    })

    app.get("/api/v1/mysql/tables/:tableId", dbCredentials, async (req, res) => {
        const { DB_NAME, DB_USER, DB_PASSWORD } = req as any // avoid type errors caused by express typing
        const tableId = req.params.tableId
        const page = Number(req.query.page) || 1

        console.log({ DB_NAME, DB_USER, DB_PASSWORD })
        const db = new Db(DB_USER?.value, DB_PASSWORD?.value, DB_NAME?.value)
        const connected = await db.connect();
        if (!connected) {
            return res.json({
                error: "-", // avoid giving to much information about the internal error
                is_error: true,
                data: null,
            })
        }
        let result = await db.getTableItems(tableId, page)
        res.json({
            is_error: false,
            error: null,
            data: result
        })
        await db.close()
        return
    })


    app.get("/api/v1/mysql/tables/:tableId/:field/:fieldValue", dbCredentials, async (req, res) => {
        const { DB_NAME, DB_USER, DB_PASSWORD } = req as any // avoid type errors caused by express typing
        const { tableId, field, fieldValue } = req.params
        const page = Number(req.query.page) || 1

        console.log({ DB_NAME, DB_USER, DB_PASSWORD })
        const db = new Db(DB_USER?.value, DB_PASSWORD?.value, DB_NAME?.value)
        const connected = await db.connect();
        if (!connected) {
            return res.json({
                error: "-", // avoid giving to much information about the internal error
                is_error: true,
                data: null,
            })
        }
        let result = await db.getItem(tableId, field, fieldValue)
        res.json({
            is_error: false,
            error: null,
            data: result
        })
        await db.close()
        return
    })
})

