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
import { IconCheck, IconRefresh, IconLoader2 } from '@tabler/icons-react';
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
        <IconLoader2 className="w-8 h-8 animate-spin" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }} className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>
            {cvId ? 'Modifier mon CV' : 'Nouveau CV'}
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
            Renseignez vos informations pour personnaliser vos entretiens
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: 'pointer' }}>
          {saving ? <IconLoader2 className="w-4 animate-spin" /> : <IconCheck style={{ width: '15px', height: '15px' }} />}
          Enregistrer
        </button>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Titre du CV</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827' }}
          placeholder="Ex: CV Développeur Full Stack" />
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>Qui êtes-vous ?</h2>
          <button onClick={() => setPersonalDetails({ fullName: '', email: '', phone: '', address: '', photoUrl: '', postSeeking: '', description: '' })}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
            <IconRefresh style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
        <PersonalDetailsForm personalDetails={personalDetails} setPersonalDetails={setPersonalDetails} setFile={setFile} />
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>Expériences</h2>
          <button onClick={() => setExperiences([])}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
            <IconRefresh style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
        <ExperienceForm experience={experiences} setExperiences={setExperiences} />
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>Formations</h2>
          <button onClick={() => setEducations([])}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
            <IconRefresh style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
        <EducationForm educations={educations} setEducations={setEducations} />
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>Langues</h2>
          <button onClick={() => setLanguages([])}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
            <IconRefresh style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
        <LanguageForm languages={languages} setLanguages={setLanguages} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>Compétences</h2>
            <button onClick={() => setSkills([])}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
              <IconRefresh style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
          <SkillForm skills={skills} setSkills={setSkills} />
        </div>
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>Loisirs</h2>
            <button onClick={() => setHobbies([])}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
              <IconRefresh style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
          <HobbyForm hobbies={hobbies} setHobbies={setHobbies} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: 'pointer' }}>
          {saving ? <IconLoader2 className="w-4 animate-spin" /> : <IconCheck style={{ width: '15px', height: '15px' }} />}
          {cvId ? 'Mettre à jour' : 'Créer mon CV'}
        </button>
      </div>
    </div>
  );
}
