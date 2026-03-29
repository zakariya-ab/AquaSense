import { useState } from "react";
import { useNavigate } from "react-router";
import { Droplets, Lock, User } from "lucide-react";
import logo from "../../assets/logo.png";
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - in production, validate credentials
    if (email && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2ECC71] to-[#3498DB] p-4 sm:p-6">
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-lg mb-3 sm:mb-4">
            <img src={logo} alt="AquaSense Logo" className="w-20 h-20 sm:w-28 sm:h-28" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('login.title')}</h1>
          <p className="text-white/90 text-sm sm:text-base">{t('login.subtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('login.welcome')}</h2>
            <p className="text-sm sm:text-base text-gray-600">{t('login.instruction')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm sm:text-base text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2ECC71] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm sm:text-base text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2ECC71] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-[#2ECC71]"
                />
                <span className="text-xs sm:text-sm text-gray-600">{t('login.remember')}</span>
              </label>
              <a href="#" className="text-xs sm:text-sm" style={{ color: '#3498DB' }}>
                {t('login.forgot')}
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
              style={{ backgroundColor: '#2ECC71' }}
            >
              {t('login.signIn')}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              <span className="font-semibold">{t('login.demo')}</span> {t('login.demoText')}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-5 sm:mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:underline text-sm sm:text-base"
          >
            {t('login.backHome')}
          </button>
        </div>
      </div>
    </div>
  );
}