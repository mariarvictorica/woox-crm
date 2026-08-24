import React, { useEffect, useMemo, useState } from 'react';
import { PlatformRole } from '../types';
import { FormField } from './FormField';
import { EMAIL_RE, SIGN_IN_VARIANTS } from '../data/initialData';

interface SignInViewProps {
  /** Which of the three sign-ins to render, from the location hash. */
  variantRole: PlatformRole;
  onVariantChange: (role: PlatformRole) => void;
  /** Resolves the credentials. Returns an error message, or null on success. */
  onSignIn: (email: string, password: string, role: PlatformRole) => string | null;
}

type Step = 'signin' | 'reset-request' | 'reset-sent';

/**
 * The three sign-ins are one screen: they differ only by the role tag and the
 * demo credentials, so building three components would be three things to keep
 * in sync for no gain. In production each is its own URL; here the variant
 * comes from the hash, which is why the switcher below sets the hash rather
 * than local state.
 *
 * There is no backend, so "reset password" confirms what would be sent rather
 * than pretending an email went out.
 */
export const SignInView: React.FC<SignInViewProps> = ({
  variantRole,
  onVariantChange,
  onSignIn
}) => {
  const variant = useMemo(
    () => SIGN_IN_VARIANTS.find(v => v.role === variantRole) || SIGN_IN_VARIANTS[1],
    [variantRole]
  );

  const [step, setStep] = useState<Step>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switching variant is arriving at a different address: start clean rather
  // than carrying one role's half-typed credentials to another.
  useEffect(() => {
    setStep('signin');
    setEmail('');
    setPassword('');
    setResetEmail('');
    setErrors({});
    setFormError('');
    setIsSubmitting(false);
  }, [variantRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'Escribí tu correo electrónico';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Revisá el formato del correo';
    if (!password) next.password = 'Escribí tu contraseña';

    const firstBad = ['email', 'password'].find(k => next[k]);
    if (firstBad) {
      setErrors(next);
      requestAnimationFrame(() => document.getElementById(`signin-${firstBad}`)?.focus());
      return;
    }

    setIsSubmitting(true);
    // Brief pause so the pending state is visible, matching the invite drawer.
    setTimeout(() => {
      const message = onSignIn(email.trim().toLowerCase(), password, variantRole);
      setIsSubmitting(false);
      if (message) {
        setFormError(message);
        requestAnimationFrame(() => document.getElementById('signin-password')?.focus());
      }
    }, 250);
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const value = resetEmail.trim();
    if (!value) {
      setErrors({ resetEmail: 'Escribí tu correo electrónico' });
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setErrors({ resetEmail: 'Revisá el formato del correo' });
      return;
    }
    setErrors({});
    setStep('reset-sent');
  };

  return (
    <div className="signin-screen" id="view-signin">
      <div className="signin-card">
        <div className="signin-brand">
          <span className="signin-logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </span>
          <div>
            <div className="signin-brand-name">WooX CRM</div>
            <div className="signin-brand-sub">V1 · Prototipo</div>
          </div>
          <span className="signin-role-tag" id="signin-role-tag">
            {variant.tag}
          </span>
        </div>

        {step === 'signin' && (
          <>
            <h1 className="signin-title">Iniciá sesión</h1>
            <p className="signin-subtitle">Accedé con la cuenta que te dieron de alta.</p>

            <form id="form-signin" onSubmit={handleSubmit} noValidate autoComplete="off">
              <FormField
                label="Correo electrónico"
                htmlFor="signin-email"
                required
                error={errors.email}
              >
                <input
                  type="email"
                  inputMode="email"
                  id="signin-email"
                  autoComplete="off"
                  placeholder="tu.correo@empresa.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    if (formError) setFormError('');
                  }}
                />
              </FormField>

              <FormField
                label="Contraseña"
                htmlFor="signin-password"
                required
                error={errors.password}
              >
                <input
                  type="password"
                  id="signin-password"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    if (formError) setFormError('');
                  }}
                />
              </FormField>

              {formError && (
                <div className="signin-form-error" role="alert" id="signin-form-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {formError}
                </div>
              )}

              <button
                type="submit"
                id="btn-signin"
                className="btn btn-primary signin-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
              </button>

              <button
                type="button"
                id="btn-forgot-password"
                className="btn btn-ghost btn-sm signin-link"
                onClick={() => {
                  setResetEmail(email.trim());
                  setErrors({});
                  setFormError('');
                  setStep('reset-request');
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>

            <div className="signin-demo" id="signin-demo-hint">
              <div className="signin-demo-title">Credenciales de demo</div>
              <div className="signin-demo-row">
                <code>{variant.demoEmail}</code>
                <code>{variant.demoPassword}</code>
              </div>
              <button
                type="button"
                id="btn-fill-demo"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEmail(variant.demoEmail);
                  setPassword(variant.demoPassword);
                  setErrors({});
                  setFormError('');
                }}
              >
                Completar automáticamente
              </button>
            </div>
          </>
        )}

        {step === 'reset-request' && (
          <>
            <h1 className="signin-title">Restablecer contraseña</h1>
            <p className="signin-subtitle">
              Te enviamos un enlace para que elijas una contraseña nueva.
            </p>

            <form id="form-reset-request" onSubmit={handleResetRequest} noValidate autoComplete="off">
              <FormField
                label="Correo electrónico"
                htmlFor="reset-email"
                required
                error={errors.resetEmail}
              >
                <input
                  type="email"
                  inputMode="email"
                  id="reset-email"
                  autoComplete="off"
                  placeholder="tu.correo@empresa.com"
                  value={resetEmail}
                  onChange={e => {
                    setResetEmail(e.target.value);
                    if (errors.resetEmail) setErrors(prev => ({ ...prev, resetEmail: '' }));
                  }}
                />
              </FormField>

              <button type="submit" id="btn-send-reset" className="btn btn-primary signin-submit">
                Enviar enlace
              </button>

              <button
                type="button"
                id="btn-back-to-signin"
                className="btn btn-ghost btn-sm signin-link"
                onClick={() => {
                  setStep('signin');
                  setErrors({});
                }}
              >
                Volver a iniciar sesión
              </button>
            </form>
          </>
        )}

        {step === 'reset-sent' && (
          <div className="signin-sent" id="signin-reset-sent">
            <span className="signin-sent-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <h1 className="signin-title">Revisá tu correo</h1>
            <p className="signin-subtitle">
              Si <b>{resetEmail}</b> corresponde a una cuenta activa, va a recibir un enlace para
              elegir una contraseña nueva.
            </p>
            <p className="signin-note">
              En el prototipo no se envía ningún correo — este paso muestra qué recibiría la persona.
            </p>
            <button
              type="button"
              id="btn-reset-done"
              className="btn btn-primary signin-submit"
              onClick={() => {
                setStep('signin');
                setPassword('');
              }}
            >
              Volver a iniciar sesión
            </button>
          </div>
        )}
      </div>

      {/* Prototype-only: production gives each role its own URL, so this
          stands in for typing three different addresses. */}
      <div className="signin-variants" id="signin-variants">
        <span className="signin-variants-label">Prototipo · ver el acceso de</span>
        {SIGN_IN_VARIANTS.map(v => (
          <button
            key={v.role}
            type="button"
            id={`btn-signin-variant-${v.role}`}
            className={`signin-variant-btn ${v.role === variantRole ? 'active' : ''}`}
            onClick={() => onVariantChange(v.role)}
          >
            {v.tag}
          </button>
        ))}
      </div>
    </div>
  );
};
