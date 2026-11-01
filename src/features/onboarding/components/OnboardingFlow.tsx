import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, User, Target, Zap, Palette, Rocket } from 'lucide-react';
import { useOnboardingStore } from '@/shared/stores/onboardingStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/lib/cn';

const steps = [
  { id: 0, title: 'Perfil', icon: User },
  { id: 1, title: 'Objetivos', icon: Target },
  { id: 2, title: 'Foco', icon: Zap },
  { id: 3, title: 'Preferências', icon: Palette },
  { id: 4, title: 'Finalização', icon: Rocket },
];

interface OnboardingFlowProps {
  onClose?: () => void;
}

export function OnboardingFlow({ onClose }: OnboardingFlowProps) {
  const { currentStep, formData, setStep, updateFormData, completeOnboarding } = useOnboardingStore();
  const { setProfile, profile, user } = useAuthStore();
  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const profileId = profile?.id ?? user?.id;

      if (!profileId) {
        completeOnboarding();
        if (onClose) onClose();
        return;
      }

      const updatedProfile = {
        id: profileId,
        full_name: formData.fullName,
        nickname: formData.nickname,
        goals: formData.goals,
        focus_areas: formData.focusAreas,
        theme: formData.theme,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      setProfile({ ...profile, ...updatedProfile });

      if (formData.theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(formData.theme);
        localStorage.setItem('theme', formData.theme);
      }

      completeOnboarding();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      if (onClose) onClose();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Como devemos te chamar?</label>
              <Input
                placeholder="Seu nome completo"
                value={formData.fullName || ''}
                onChange={(e) => updateFormData({ fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nickname (opcional)</label>
              <Input
                placeholder="Ex: Maverick"
                value={formData.nickname || ''}
                onChange={(e) => updateFormData({ nickname: e.target.value })}
              />
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="step-1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground mb-4">Selecione seus principais objetivos para este ano:</p>
            <div className="grid grid-cols-1 gap-2">
              {['Saúde & Fitness', 'Liberdade Financeira', 'Desenvolvimento de Carreira', 'Aprendizado de Novas Habilidades', 'Bem-estar Mental'].map((goal) => (
                <button
                  key={goal}
                  onClick={() => {
                    const currentGoals = formData.goals || [];
                    const newGoals = currentGoals.includes(goal)
                      ? currentGoals.filter((g) => g !== goal)
                      : [...currentGoals, goal];
                    updateFormData({ goals: newGoals });
                  }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border transition-all text-left",
                    formData.goals?.includes(goal)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded border flex items-center justify-center", formData.goals?.includes(goal) ? "bg-primary-cta border-primary" : "bg-transparent border-muted-foreground")}>
                    {formData.goals?.includes(goal) && <Check size={12} className="text-primary-foreground" />}
                  </div>
                  <span className="text-sm font-medium">{goal}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step-2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground mb-4">Em qual área você quer focar inicialmente?</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'habits', label: 'Hábitos e Rotinas', desc: 'Melhore sua disciplina diária' },
                { id: 'finances', label: 'Gestão Financeira', desc: 'Controle gastos e investimentos' },
                { id: 'tasks', label: 'Gestão de Tarefas', desc: 'Maximize sua produtividade' }
              ].map((focus) => (
                <button
                  key={focus.id}
                  onClick={() => {
                    const currentFocus = formData.focusAreas || [];
                    const newFocus = currentFocus.includes(focus.id)
                      ? currentFocus.filter((f) => f !== focus.id)
                      : [...currentFocus, focus.id];
                    updateFormData({ focusAreas: newFocus });
                  }}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-left",
                    formData.focusAreas?.includes(focus.id)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-bold text-sm">{focus.label}</div>
                  <div className="text-xs opacity-70">{focus.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step-3"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-4">
              <label className="text-sm font-medium">Preferência de Tema</label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateFormData({ theme: t })}
                    className={cn(
                      "p-4 rounded-lg border flex flex-col items-center gap-2 transition-all capitalize",
                      formData.theme === t
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border", t === 'light' ? "bg-white" : t === 'dark' ? "bg-slate-900" : "bg-gradient-to-br from-white to-slate-900")} />
                    <span className="text-xs">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step-4"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
              <Rocket size={40} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Quase lá, {formData.nickname || formData.fullName || 'Recruta'}!</h3>
              <p className="text-sm text-muted-foreground">O Life OS está pronto para ser inicializado com suas configurações.</p>
            </div>
            <Card className="p-4 bg-surface/50 text-left space-y-2 border-dashed">
              <div className="text-xs flex justify-between">
                <span className="text-muted-foreground uppercase font-mono tracking-tighter">Objetivos:</span>
                <span className="font-medium">{(formData.goals || []).length} selecionados</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-muted-foreground uppercase font-mono tracking-tighter">Áreas de Foco:</span>
                <span className="font-medium">{(formData.focusAreas || []).join(', ')}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-muted-foreground uppercase font-mono tracking-tighter">Tema:</span>
                <span className="font-medium capitalize">{formData.theme || 'Não definido'}</span>
              </div>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-8">
      {/* Progress */}
      <div className="flex justify-between items-center mb-12">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                currentStep === s.id
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                  : currentStep > s.id
                    ? "border-primary bg-primary-cta text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground"
              )}
            >
              {currentStep > s.id ? <Check size={20} /> : <s.icon size={20} />}
            </div>
            <span className={cn("text-[10px] font-mono uppercase tracking-widest", currentStep >= s.id ? "text-primary" : "text-muted-foreground")}>
              {s.title}
            </span>
          </div>
        ))}
        {/* Connection Line */}
        <div className="absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-border -z-10">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[400px] flex flex-col">
        <div className="flex-grow">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={handleComplete} className="flex-1">
            Pular
          </Button>

          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ArrowLeft className="mr-2" size={16} /> Voltar
            </Button>
          )}

          {currentStep === steps.length - 1 ? (
            <Button onClick={nextStep} className="flex-1 bg-primary-cta text-primary-foreground hover:bg-primary-cta/90">
              INICIALIZAR SISTEMA <Rocket className="ml-2" size={16} />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex-1"
              disabled={currentStep === 0 && !formData.fullName}
            >
              Continuar <ArrowRight className="ml-2" size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
