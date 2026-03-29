import { useNavigate } from "react-router";
import { Droplets, Gauge, TrendingDown, LineChart, Leaf, Clock } from "lucide-react";
import logo from "../../assets/logo.png";
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="AquaSense Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="text-xl sm:text-2xl font-semibold text-gray-900">{t('header.aquasense')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/login')}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 transition-colors"
              style={{ borderColor: '#3498DB', color: '#3498DB' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3498DB';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#3498DB';
              }}
            >
              {t('header.signIn')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('landing.hero.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            {t('landing.hero.subtitle')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 sm:px-10 py-3 sm:py-4 rounded-lg text-white text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ backgroundColor: '#2ECC71' }}
          >
            {t('landing.hero.cta')}
          </button>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('landing.challenge.title')}</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.challenge.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: '#3498DB20' }}>
                <TrendingDown className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#3498DB' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.challenge.scarcity.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t('landing.challenge.scarcity.text')}</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: '#2ECC7120' }}>
                <Clock className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#2ECC71' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.challenge.timing.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t('landing.challenge.timing.text')}</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: '#3498DB20' }}>
                <Droplets className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#3498DB' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.challenge.waste.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t('landing.challenge.waste.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('landing.features.title')}</h2>
            <p className="text-base sm:text-lg text-gray-600">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2ECC71' }}>
                  <Gauge className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.features.monitoring.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('landing.features.monitoring.text')}
                </p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3498DB' }}>
                  <Droplets className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.features.irrigation.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('landing.features.irrigation.text')}
                </p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2ECC71' }}>
                  <LineChart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.features.weather.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('landing.features.weather.text')}
                </p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3498DB' }}>
                  <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('landing.features.analytics.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('landing.features.analytics.text')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('landing.benefits.title')}</h2>
            <p className="text-base sm:text-lg text-gray-600">{t('landing.benefits.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border-t-4" style={{ borderTopColor: '#2ECC71' }}>
              <Droplets className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" style={{ color: '#3498DB' }} />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('landing.benefits.water.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('landing.benefits.water.text')}
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border-t-4" style={{ borderTopColor: '#3498DB' }}>
              <Leaf className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" style={{ color: '#2ECC71' }} />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('landing.benefits.plants.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('landing.benefits.plants.text')}
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border-t-4" style={{ borderTopColor: '#2ECC71' }}>
              <LineChart className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" style={{ color: '#3498DB' }} />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('landing.benefits.costs.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('landing.benefits.costs.text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 sm:px-12 py-3 sm:py-4 rounded-lg text-white text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ backgroundColor: '#2ECC71' }}
          >
            {t('landing.cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-600">
          <p className="text-sm sm:text-base">{t('landing.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}