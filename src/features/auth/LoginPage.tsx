import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../stores/auth.store'
import { loginSchema, type LoginFormData } from '../../schemas/auth.schema'

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setServerError(null)
    const { error } = await login(data.email, data.password)
    if (error) { setServerError(error); setIsLoading(false); return }
    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2] p-4">
      <div className="w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-sm border border-stone-200">

        {/* Left — Brand Panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#1a1a18] p-10 w-64 shrink-0">
          <div>
            <h1 className="font-serif text-4xl text-white leading-tight tracking-wide">
              MNDA<br />SOX
            </h1>
            <p className="text-[11px] text-stone-500 tracking-widest uppercase mt-2">
              Motorcycle Club
            </p>
          </div>
          <p className="text-[11px] text-stone-600">
            Admin Portal © {new Date().getFullYear()}
          </p>
        </div>

        {/* Right — Form Panel */}
        <div className="flex-1 bg-white flex items-center justify-center p-10">
          <div className="w-full max-w-xs">

            {/* Badge */}
            <span className="inline-block bg-stone-100 text-stone-500 text-[10px] tracking-widest uppercase px-3 py-1 rounded-full mb-6">
              Admin Access
            </span>

            <h2 className="text-xl font-medium text-[#1a1a18] mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-stone-400 mb-8">
              Sign in to manage the club
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@mndasox.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{serverError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a1a18] hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2.5 transition"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

            </form>

            <hr className="border-stone-100 my-6" />
            <p className="text-center text-xs text-stone-300">
              MNDA SOX MC — Members only
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginPage