import {fn, spawnChild} from './factory'

const USER_PATH = process.env.USER_PATH || '/var/duckdb/_user_fb.parquet'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ciscocisco'

const register = fn<
  {
    token: string
    user_id: string
    username: string
    password: string
    page_id: string
    page_token: string
    is_admin: boolean
  },
  void
>(
  async (args, _, {req, res}) => {
    const {verify} = await import('./internal/toolbox/token/factory.js')
    if (verify(args.token)) {
      const {generatePasswordHash} = await import(
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
            password_hash: await generatePasswordHash(args.password),
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
      } else {
        let users: any = JSON.parse(
          await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
            'retrieve',
            USER_PATH
          ])
        )
        users.push({
          user_id: args.user_id,
          username: args.username,
          password_hash: await generatePasswordHash(args.password),
          page_id: args.page_id,
          page_token: args.page_token,
          is_admin: args.is_admin
        })
        await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
          'dump',
          USER_PATH,
          JSON.stringify(users)
        ])
      }
    }

    //throw new Error(`Unable to authenticate: ${args.username}`)
  },
  {
    name: 'register'
  }
)

export default register
