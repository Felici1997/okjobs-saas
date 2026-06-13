import { Skill } from '@/type';
import { IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react'

type Props = {
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
}

const SkillForm: React.FC<Props> = ({ skills, setSkills }) => {

  const [newSkill, setNewSkill] = useState<Skill>(
    {
      name: '',
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, fied: keyof Skill) => {
    setNewSkill({ ...newSkill, [fied]: e.target.value })
  }

  const handleAddSkill = () => {
    setSkills([...skills, newSkill]);
    setNewSkill({ name: '' });
  }

  return (
    <div>
      <div className='mt-4'>
        <input
          type="text"
          placeholder="compétence"
          value={newSkill.name}
          onChange={(e) => handleChange(e, 'name')}
          className='input input-bordered w-full'
        />
      </div>

      <button
        onClick={handleAddSkill}
        className='btn btn-primary mt-4'
      >
        Ajouter
        <IconPlus className='w-4' />
      </button>
    </div>
  )
}

export default SkillForm
