import depressionImg from '../assets/assessments/assess_depression_1775810542824.png';
import anxietyImg from '../assets/assessments/assess_anxiety_1775810574094.png';
import stressImg from '../assets/assessments/assess_stress_1775810593072.png';
import selfesteemImg from '../assets/assessments/assess_selfesteem_1775810613845.png';
import burnoutImg from '../assets/assessments/assess_burnout_1775810736201.png';
import socialImg from '../assets/assessments/assess_social_1775810763339.png';
import lonelinessImg from '../assets/assessments/assess_loneliness_v2_1775810997517.png';

export const ASSESSMENTS = {
  bdi: {
    id: 'bdi',
    title: 'Depression',
    shortName: 'BDI',
    image: depressionImg,
    description: 'The BDI is one of the most effective ways to identify the presence and stage of depression. We recommend that you take this test regularly and be guided through the treatment process.',
    introMessage: 'This is the Beck Depression Inventory (BDI). It takes about 3-5 minutes. Answer honestly — there are no right or wrong answers. Your results are private and only visible to you.',
    maxScore: 63,
    questions: [
      {
        text: 'How have you been feeling sad or down recently?',
        options: [
          { text: 'I do not feel sad.', score: 0 },
          { text: 'I feel sad.', score: 1 },
          { text: 'I am sad all the time and I can\'t snap out of it.', score: 2 },
          { text: 'I am so sad and unhappy that I can\'t stand it.', score: 3 }
        ]
      },
      {
        text: 'How do you feel about the future?',
        options: [
          { text: 'I am not particularly discouraged about the future.', score: 0 },
          { text: 'I feel discouraged about the future.', score: 1 },
          { text: 'I feel I have nothing to look forward to.', score: 2 },
          { text: 'I feel the future is hopeless and things cannot improve.', score: 3 }
        ]
      },
      {
        text: 'How do you view your past successes and failures?',
        options: [
          { text: 'I do not feel like a failure.', score: 0 },
          { text: 'I feel I have failed more than the average person.', score: 1 },
          { text: 'As I look back on my life, all I can see is a lot of failures.', score: 2 },
          { text: 'I feel I am a complete failure as a person.', score: 3 }
        ]
      },
      {
        text: 'How much satisfaction do you get from things?',
        options: [
          { text: 'I get as much satisfaction out of things as I used to.', score: 0 },
          { text: 'I don\'t enjoy things the way I used to.', score: 1 },
          { text: 'I don\'t get real satisfaction out of anything anymore.', score: 2 },
          { text: 'I am dissatisfied or bored with everything.', score: 3 }
        ]
      },
      {
        text: 'How do you feel about yourself lately?',
        options: [
          { text: 'I don\'t feel disappointed in myself.', score: 0 },
          { text: 'I am disappointed in myself.', score: 1 },
          { text: 'I am disgusted with myself.', score: 2 },
          { text: 'I hate myself.', score: 3 }
        ]
      }
    ],
    getSeverity: (score) => {
      // Scale 5 questions to 21 questions range (multiplier 4.2)
      let adjustedScore = score * 4.2;
      if (adjustedScore <= 13) return { label: 'Normal state', level: 'normal', color: '#34D399' };
      if (adjustedScore <= 19) return { label: 'Mild depression', level: 'mild', color: '#FBBF24' };
      if (adjustedScore <= 28) return { label: 'Exacerbated depressive state', level: 'moderate', color: '#FB923C' };
      return { label: 'Severe depression', level: 'severe', color: '#F87171' };
    }
  },
  gad7: {
    id: 'gad7',
    title: 'Anxiety',
    shortName: 'GAD-7',
    image: anxietyImg,
    description: 'The Generalized Anxiety Disorder 7-item scale (GAD-7) is a validated test to measure the severity of your anxiety levels.',
    introMessage: 'This is the GAD-7 anxiety assessment. It takes about 2 minutes. Answer honestly — there are no right or wrong answers. Your results are private and only visible to you.',
    maxScore: 21,
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid, as if something awful might happen'
    ].map(q => ({
      text: `Over the last 2 weeks, how often have you been bothered by: ${q}?`,
      options: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      if (score <= 4) return { label: 'Minimal anxiety', level: 'normal', color: '#34D399' };
      if (score <= 9) return { label: 'Mild anxiety', level: 'mild', color: '#FBBF24' };
      if (score <= 14) return { label: 'Moderate anxiety', level: 'moderate', color: '#FB923C' };
      return { label: 'Severe anxiety', level: 'severe', color: '#F87171' };
    }
  },
  pss: {
    id: 'pss',
    title: 'Stress',
    shortName: 'PSS',
    image: stressImg,
    description: 'The Perceived Stress Scale (PSS) helps understand how different situations affect your feelings and your perceived stress.',
    introMessage: 'This is the Perceived Stress assessment. It takes about 3-5 minutes. Answer honestly — there are no right or wrong answers. Your results are private.',
    maxScore: 30, 
    questions: [
      'been upset because of something that happened unexpectedly',
      'felt that you were unable to control the important things in your life',
      'felt nervous and "stressed"',
      'found that you could not cope with all the things that you had to do',
      'been angered because of things that were outside of your control'
    ].map(q => ({
      text: `In the last month, how often have you ${q}?`,
      options: [
        { text: 'Never', score: 0 },
        { text: 'Almost Never', score: 1 },
        { text: 'Sometimes', score: 2 },
        { text: 'Very Often', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      let adjustedScore = score * 2; 
      if (adjustedScore <= 13) return { label: 'Low stress', level: 'normal', color: '#34D399' };
      if (adjustedScore <= 20) return { label: 'Moderate stress', level: 'mild', color: '#FBBF24' };
      if (adjustedScore <= 26) return { label: 'High stress', level: 'moderate', color: '#FB923C' };
      return { label: 'Very high stress', level: 'severe', color: '#F87171' };
    }
  },
  rses: {
    id: 'rses',
    title: 'Self-Esteem',
    shortName: 'RSES',
    image: selfesteemImg,
    description: 'The Rosenberg Self-Esteem Scale (RSES) measures state self-esteem by asking about your current feelings.',
    introMessage: 'This is the Self-Esteem assessment. It takes about 2 minutes. Answer honestly — there are no right or wrong answers.',
    maxScore: 15,
    questions: [
      'I feel that I am a person of worth, at least on an equal plane with others.',
      'I feel that I have a number of good qualities.',
      'I am able to do things as well as most other people.',
      'I take a positive attitude toward myself.',
      'On the whole, I am satisfied with myself.'
    ].map(q => ({
      text: q,
      options: [
        { text: 'Strongly Agree', score: 0 },
        { text: 'Agree', score: 1 },
        { text: 'Disagree', score: 2 },
        { text: 'Strongly Disagree', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      if (score <= 3) return { label: 'Normal self-esteem', level: 'normal', color: '#34D399' };
      if (score <= 7) return { label: 'Slightly low self-esteem', level: 'mild', color: '#FBBF24' };
      if (score <= 11) return { label: 'Low self-esteem', level: 'moderate', color: '#FB923C' };
      return { label: 'Very low self-esteem', level: 'severe', color: '#F87171' };
    }
  },
  mbi: {
    id: 'mbi',
    title: 'Work Burnout',
    shortName: 'MBI',
    image: burnoutImg,
    description: 'The Maslach Burnout Inventory simplified scale helps evaluate feelings of occupational burnout and emotional exhaustion.',
    introMessage: 'This is the Work Burnout assessment. Focus on how you have been feeling at work recently.',
    maxScore: 15,
    questions: [
      'I feel emotionally drained from my work.',
      'I feel used up at the end of the workday.',
      'I feel fatigued when I get up in the morning and have to face another day on the job.',
      'Working with people all day is really a strain for me.',
      'I feel burned out from my work.'
    ].map(q => ({
      text: q,
      options: [
        { text: 'Never', score: 0 },
        { text: 'A few times a month', score: 1 },
        { text: 'A few times a week', score: 2 },
        { text: 'Every day', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      if (score <= 4) return { label: 'Low burnout', level: 'normal', color: '#34D399' };
      if (score <= 8) return { label: 'Moderate burnout', level: 'mild', color: '#FBBF24' };
      if (score <= 11) return { label: 'High burnout', level: 'moderate', color: '#FB923C' };
      return { label: 'Severe burnout', level: 'severe', color: '#F87171' };
    }
  },
  spin: {
    id: 'spin',
    title: 'Social Anxiety',
    shortName: 'SPIN',
    image: socialImg,
    description: 'The Social Phobia Inventory (SPIN) screens for social anxiety disorder symptoms including fear, avoidance, and physiological distress.',
    introMessage: 'This is the Social Anxiety assessment. Consider your social interactions in the past week.',
    maxScore: 15,
    questions: [
      'I am afraid of people in authority.',
      'I avoid talking to people I don\'t know.',
      'I am bothered by blushing in front of people.',
      'Parties and social events scare me.',
      'Being criticized scares me a lot.'
    ].map(q => ({
      text: q,
      options: [
        { text: 'Not at all', score: 0 },
        { text: 'A little bit', score: 1 },
        { text: 'Somewhat', score: 2 },
        { text: 'Very much', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      if (score <= 4) return { label: 'Normal social anxiety', level: 'normal', color: '#34D399' };
      if (score <= 8) return { label: 'Mild social anxiety', level: 'mild', color: '#FBBF24' };
      if (score <= 11) return { label: 'Moderate social anxiety', level: 'moderate', color: '#FB923C' };
      return { label: 'Severe social anxiety', level: 'severe', color: '#F87171' };
    }
  },
  ucla: {
    id: 'ucla',
    title: 'Loneliness',
    shortName: 'UCLA',
    image: lonelinessImg,
    description: 'The UCLA Loneliness Scale is a widely used measure of general feelings of social isolation and loneliness.',
    introMessage: 'This is the Loneliness assessment. Consider your feelings of connection over the last few weeks.',
    maxScore: 15,
    questions: [
      'How often do you feel that you lack companionship?',
      'How often do you feel left out?',
      'How often do you feel isolated from others?',
      'How often do you feel that no one really knows you well?',
      'How often do you feel that people are around you but not with you?'
    ].map(q => ({
      text: q,
      options: [
        { text: 'Hardly ever', score: 0 },
        { text: 'Sometimes', score: 1 },
        { text: 'Often', score: 2 },
        { text: 'Almost always', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      if (score <= 4) return { label: 'Low loneliness', level: 'normal', color: '#34D399' };
      if (score <= 8) return { label: 'Moderate loneliness', level: 'mild', color: '#FBBF24' };
      if (score <= 11) return { label: 'High loneliness', level: 'moderate', color: '#FB923C' };
      return { label: 'Severe loneliness', level: 'severe', color: '#F87171' };
    }
  },
  wemwbs: {
    id: 'wemwbs',
    title: 'Emotional Wellbeing',
    shortName: 'WEMWBS',
    image: anxietyImg, // placeholder
    description: 'The Warwick-Edinburgh Mental Well-being Scale measures positive mental health and overall emotional wellbeing.',
    introMessage: 'This is the Emotional Wellbeing assessment. Focus on positive feelings and how you function.',
    maxScore: 15,
    questions: [
      'I\'ve been feeling optimistic about the future',
      'I\'ve been feeling useful',
      'I\'ve been feeling relaxed',
      'I\'ve been dealing with problems well',
      'I\'ve been thinking clearly'
    ].map(q => ({
      text: `In the last 2 weeks: ${q}`,
      options: [
        { text: 'All of the time', score: 0 },
        { text: 'Often', score: 1 },
        { text: 'Rarely', score: 2 },
        { text: 'None of the time', score: 3 }
      ]
    })),
    getSeverity: (score) => {
      if (score <= 4) return { label: 'High wellbeing', level: 'normal', color: '#34D399' };
      if (score <= 8) return { label: 'Average wellbeing', level: 'mild', color: '#FBBF24' };
      if (score <= 11) return { label: 'Low wellbeing', level: 'moderate', color: '#FB923C' };
      return { label: 'Very low wellbeing', level: 'severe', color: '#F87171' };
    }
  }
};

export const ASSESSMENT_LIST = Object.values(ASSESSMENTS);
