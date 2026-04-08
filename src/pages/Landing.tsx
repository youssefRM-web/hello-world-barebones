
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, FileText, BarChart3, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/Common/LanguageSelector";

const Landing = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Building,
      title: t('features.buildingManagement.title'),
      description: t('features.buildingManagement.description')
    },
    {
      icon: Users,
      title: t('features.teamCollaboration.title'),
      description: t('features.teamCollaboration.description')
    },
    {
      icon: FileText,
      title: t('features.documentManagement.title'),
      description: t('features.documentManagement.description')
    },
    {
      icon: BarChart3,
      title: t('features.analytics.title'),
      description: t('features.analytics.description')
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description')
    },
    {
      icon: Zap,
      title: t('features.automation.title'),
      description: t('features.automation.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FacilityPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector variant="buttons" />
              <Link to="/login">
                <Button variant="ghost">{t('nav.signIn')}</Button>
              </Link>
              <Link to="/login">
                <Button>{t('nav.getStarted')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('landing.title')}
            <span className="text-blue-600"> {t('landing.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('landing.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                {t('landing.startFreeTrial')}
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t('landing.watchDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.featuresSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('landing.ctaSubtitle')}
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              {t('landing.ctaButton')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-lg font-semibold">FacilityPro</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t('landing.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
