import type {
  InterviewPack,
  InterviewQuestion,
  Job,
  StructuredResumeProfile,
} from '../../types'

function uid() {
  return `iq_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Free local interview pack generator.
 * Questions are grounded in JD text + resume facts only — no invented experience.
 */
export function generateInterviewPack(
  job: Job,
  profile: StructuredResumeProfile,
): InterviewPack {
  const skills = profile.skills.slice(0, 8)
  const topSkill = skills[0] ?? 'your core technical stack'
  const skill2 = skills[1] ?? topSkill
  const skill3 = skills[2] ?? skill2
  const must = job.mustHave[0] ?? topSkill
  const must2 = job.mustHave[1] ?? skill2
  const exp = profile.experience[0]
  const years = profile.yearsExperience || 'several'
  const cert = profile.certifications[0]

  const questions: InterviewQuestion[] = [
    {
      id: uid(),
      type: 'company',
      question: `Why ${job.company}, and how does this ${job.title} role fit your career direction?`,
      framework:
        'Company motivation → role fit using your stated target roles → 1–2 resume facts that map to their domain → close with curiosity about their customers/product.',
      basedOn: `Company: ${job.company}; your title: ${profile.title}`,
    },
    {
      id: uid(),
      type: 'company',
      question: `What do you know about ${job.company}'s market, and what would you want to learn in the first 90 days as a ${job.title}?`,
      framework:
        'Acknowledge public facts only (don’t invent) → map to solutions/pre-sales motions → 30/60/90 learning plan tied to listed skills.',
      basedOn: `Role: ${job.title} at ${job.company}`,
    },
    {
      id: uid(),
      type: 'technical',
      question: `Walk through how you would design a customer demo or POC that uses ${must}${must2 !== must ? ` and ${must2}` : ''}.`,
      framework:
        'Clarify customer goal → architecture sketch → demo path → risks/gaps → success metrics. Only claim tools on your resume.',
      basedOn: `JD must-haves: ${job.mustHave.slice(0, 4).join(', ') || 'role skills'}`,
    },
    {
      id: uid(),
      type: 'technical',
      question: `How have you applied ${topSkill} in a customer-facing or solutions context?`,
      framework: `STAR: Situation → Task → Action (with ${topSkill}) → Result. Stay inside resume bullets.`,
      basedOn: `Resume skill: ${topSkill}`,
    },
    {
      id: uid(),
      type: 'technical',
      question: `Compare when you would choose ${skill2} vs ${skill3} for a solutions engagement.`,
      framework:
        'Decision criteria → trade-offs → customer impact → example from past work if present on resume.',
      basedOn: `Resume skills: ${skill2}, ${skill3}`,
    },
    {
      id: uid(),
      type: 'behavioral',
      question:
        'Describe a time a deal or engagement stalled on technical objections — how did you unblock it?',
      framework:
        'STAR with objection handling: listen → reframe → proof (demo/POC/reference) → outcome. Don’t invent employers or metrics.',
      basedOn: 'Pre-sales / solutions behavioral pattern',
    },
    {
      id: uid(),
      type: 'behavioral',
      question:
        'Tell me about partnering with sales or account teams under a tight deadline.',
      framework:
        'Context → collaboration model → your technical ownership → result. Align with workshops/RFP language on your resume if present.',
      basedOn: 'Cross-functional collaboration',
    },
    {
      id: uid(),
      type: 'resume',
      question: exp
        ? `At ${exp.company} as ${exp.title}, what was the most relevant outcome for a role like ${job.title}?`
        : `With about ${years} years of experience, which accomplishment best supports this ${job.title} role?`,
      framework:
        'Pick one resume bullet → expand with context → quantify only if the number is already on the resume → map to this JD.',
      basedOn: exp
        ? `Experience: ${exp.title} @ ${exp.company}`
        : `Years on profile: ${years}`,
    },
    {
      id: uid(),
      type: 'resume',
      question: cert
        ? `How does your ${cert} certification show up in day-to-day solutions work?`
        : `Which skills on your resume would you lean on most for ${job.company}?`,
      framework:
        'Cert/skill → practical application → customer scenario → honesty about depth.',
      basedOn: cert ? `Certification: ${cert}` : `Skills: ${skills.slice(0, 4).join(', ')}`,
    },
    {
      id: uid(),
      type: 'job',
      question: `This role emphasizes: ${job.summary.slice(0, 160)}${job.summary.length > 160 ? '…' : ''} How would you approach the first customer workshop?`,
      framework:
        'Discovery agenda → stakeholders → demo narrative → follow-ups. Ground tools in your skill list only.',
      basedOn: 'Job summary text',
    },
    {
      id: uid(),
      type: 'job',
      question:
        job.missingSkills?.length || job.mustHave.length
          ? `The posting may expect areas such as ${(job.missingSkills?.length ? job.missingSkills : job.mustHave).slice(0, 3).join(', ')}. Which of these do you already cover, and where would you upskill?`
          : `What parts of this ${job.title} posting are strongest matches for you, and what would you learn on the job?`,
      framework:
        'Honest coverage from resume → related transferable proof → learning plan. Never claim missing skills as experience.',
      basedOn: 'Match gaps / must-haves',
    },
  ]

  // Add bullet-specific question if we have a metric bullet
  const metricBullet = profile.experience
    .flatMap((e) => e.bullets.map((b) => ({ b, company: e.company })))
    .find((x) => /\d+%|₹|pipeline|reduced|increased|won/i.test(x.b))
  if (metricBullet) {
    questions.push({
      id: uid(),
      type: 'resume',
      question: `You mention: “${metricBullet.b.slice(0, 120)}${metricBullet.b.length > 120 ? '…' : ''}” — walk us through that story.`,
      framework: 'STAR with the exact metric already written — no inflation.',
      basedOn: `Bullet from ${metricBullet.company}`,
    })
  }

  const tips = [
    `Lead with solutions/pre-sales outcomes aligned to ${job.title}.`,
    `Name only skills present on your resume: ${skills.slice(0, 5).join(', ') || '—'}.`,
    `Location context: ${job.city} · ${job.workMode}.`,
    'If asked about a gap skill, reframe with adjacent resume evidence and a learning plan — do not invent experience.',
    'Prefer original apply/company page facts over assumptions about the employer.',
  ]

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    generatedAt: new Date().toISOString(),
    questions,
    tips,
    disclaimer:
      'Local free generator. Questions are templates grounded in your resume facts and the job text. Not a guarantee of interview content.',
  }
}

export function questionTypeLabel(t: InterviewQuestion['type']): string {
  switch (t) {
    case 'company':
      return 'Company'
    case 'technical':
      return 'Technical'
    case 'behavioral':
      return 'Behavioral'
    case 'resume':
      return 'Resume-specific'
    case 'job':
      return 'Job-description'
  }
}
