'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">Contactez-nous</h1>
              <p className="mt-4 text-lg text-base-content/60">
                Une question, une suggestion ? On vous répond dans les plus brefs délais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                {sent ? (
                  <div className="alert alert-success">
                    <Mail className="w-5" />
                    <span>Message envoyé ! Nous vous répondrons rapidement.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text">Nom</span></label>
                      <input type="text" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Email</span></label>
                      <input type="email" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Message</span></label>
                      <textarea className="textarea textarea-bordered h-32" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                      <Send className="w-4" />
                      Envoyer
                    </button>
                  </form>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Email</h3>
                    <p className="text-sm text-base-content/60">contact@okjobs.fr</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Chat</h3>
                    <p className="text-sm text-base-content/60">Disponible du lundi au vendredi, 9h-18h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
