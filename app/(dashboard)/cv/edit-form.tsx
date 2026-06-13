'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import PersonalDetailsForm from '@/app/components/PersonalDetailsForm';
import ExperienceForm from '@/app/components/ExperienceForm';
import EducationForm from '@/app/components/EducationForm';
import SkillForm from '@/app/components/SkillForm';
import LanguageForm from '@/app/components/LanguageForm';
import HobbyForm from '@/app/components/HobbyForm';
import {
  Save,
  RotateCw,
  Loader2,
} from 'lucide-react';
import type {
  PersonalDetails,
  Experience,
  Education,
  Skill,
  Language,
  Hobby,
} from '@/types';

type Props = {
  cvId?: string;
};

export default function CVEditForm({ cvId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(!!cvId);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('Mon CV');
  const [file, setFile] = useState<File | null>(null);

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    photoUrl: '',
    postSeeking: '',
    description: '',
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);

  useEffect(() => {
    if (!cvId || !user) return;

    supabase
      .from('cv_documents')
      .select('*')
      .eq('id', cvId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push('/cv');
          return;
        }
        setTitle(data.title);
        setPersonalDetails(data.personal_details as PersonalDetails);
        setExperiences(data.experiences as Experience[]);
        setEducations(data.educations as Education[]);
        setSkills(data.skills as Skill[]);
        setLanguages(data.languages as Language[]);
        setHobbies(data.hobbies as Hobby[]);
        setLoading(false);
      });
  }, [cvId, user, supabase, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let photoUrl = personalDetails.photoUrl;

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `photos/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('cv-photos')
        .upload(fileName, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('cv-photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    const payload = {
      user_id: user.id,
      title,
      personal_details: { ...personalDetails, photoUrl },
      experiences,
      educations,
      skills,
      languages,
      hobbies,
      updated_at: new Date().toISOString(),
    };

    if (cvId) {
      await supabase.from('cv_documents').update(payload).eq('id', cvId);
    } else {
      const { data } = await supabase
        .from('cv_documents')
        .insert({ ...payload, is_active: true })
        .select('id')
        .single();

      if (data) {
        router.push(`/cv/${data.id}`);
        return;
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {cvId ? 'Modifier mon CV' : 'Nouveau CV'}
          </h1>
          <p className="text-base-content/60 mt-1">
            Renseignez vos informations pour personnaliser vos entretiens
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 animate-spin" />
          ) : (
            <Save className="w-4" />
          )}
          Enregistrer
        </button>
      </div>

      {/* Title */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Titre du CV</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Ex: CV Développeur Full Stack"
        />
      </div>

      {/* Personal Details */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Qui êtes-vous ?</h2>
            <button
              onClick={() =>
                setPersonalDetails({
                  fullName: '',
                  email: '',
                  phone: '',
                  address: '',
                  photoUrl: '',
                  postSeeking: '',
                  description: '',
                })
              }
              className="btn btn-ghost btn-sm"
            >
              <RotateCw className="w-4" />
            </button>
          </div>
          <PersonalDetailsForm
            personalDetails={personalDetails}
            setPersonalDetails={setPersonalDetails}
            setFile={setFile}
          />
        </div>
      </div>

      {/* Experiences */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Expériences</h2>
            <button
              onClick={() => setExperiences([])}
              className="btn btn-ghost btn-sm"
            >
              <RotateCw className="w-4" />
            </button>
          </div>
          <ExperienceForm experience={experiences} setExperiences={setExperiences} />
        </div>
      </div>

      {/* Education */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Formations</h2>
            <button
              onClick={() => setEducations([])}
              className="btn btn-ghost btn-sm"
            >
              <RotateCw className="w-4" />
            </button>
          </div>
          <EducationForm educations={educations} setEducations={setEducations} />
        </div>
      </div>

      {/* Languages */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Langues</h2>
            <button
              onClick={() => setLanguages([])}
              className="btn btn-ghost btn-sm"
            >
              <RotateCw className="w-4" />
            </button>
          </div>
          <LanguageForm languages={languages} setLanguages={setLanguages} />
        </div>
      </div>

      {/* Skills + Hobbies side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Compétences</h2>
              <button
                onClick={() => setSkills([])}
                className="btn btn-ghost btn-sm"
              >
                <RotateCw className="w-4" />
              </button>
            </div>
            <SkillForm skills={skills} setSkills={setSkills} />
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Loisirs</h2>
              <button
                onClick={() => setHobbies([])}
                className="btn btn-ghost btn-sm"
              >
                <RotateCw className="w-4" />
              </button>
            </div>
            <HobbyForm hobbies={hobbies} setHobbies={setHobbies} />
          </div>
        </div>
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 animate-spin" />
          ) : (
            <Save className="w-4" />
          )}
          {cvId ? 'Mettre à jour' : 'Créer mon CV'}
        </button>
      </div>
    </div>
  );
}
