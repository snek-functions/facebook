import {fn, spawnChild} from './factory'
import {User} from './types'

const USER_PATH = process.env.USER_PATH || '/var/duckdb/_user_fb.parquet'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ciscocisco'

const login = fn<
  {username: string; password: string},
  {
    user_id: string
    jwtid: string
    accessToken: string
  }
>(
  async ({username, password}, _, {req, res}) => {
    const {verify, generatePasswordHash} = await import(
      './internal/toolbox/hash/hash.js'
    )
    const scope = {
      res1: ['read', 'write'],
      res2: ['read', 'write']
    }

    // Check if user.parquet file exists and if not, create it
    const fs = await import('fs')
    if (!fs.existsSync(USER_PATH)) {
      const defaultUser = [
        {
          user_id: '0',
          username: 'admin',
          password_hash: await generatePasswordHash(ADMIN_PASSWORD),
          page_id: '0',
          page_token: '',
          is_admin: true
        }
      ]

      await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
        'dump',
        USER_PATH,
        JSON.stringify(defaultUser)
      ])
    }

    const userStr = await spawnChild(
      'venv/bin/python',
      'internal/toolbox/pit/pit.py',
      ['search', USER_PATH, `username=${username}`]
    )
    console.log(userStr)

    const user = JSON.parse(userStr)[0] as User

    if (user.user_id !== '007') {
      if (await verify(password, user.password_hash)) {
        const {newAccessToken} = await import(
          './internal/toolbox/token/factory.js'
        )
        const Session: any = await newAccessToken({
          subject: user.user_id,
          payload: {
            scope
          },
          durration: '12h'
        })
        return {
          user_id: user.user_id.toString(),
          jwtid: Session.jwtid,
          accessToken: Session.token
        }
      }
    }

    throw new Error(`Unable to authenticate: ${username}`)
  },
  {
    name: 'login'
  }
)

export default login
