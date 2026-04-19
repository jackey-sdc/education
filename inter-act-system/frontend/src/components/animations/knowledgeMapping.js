export const KNOWLEDGE_ANIMATION_MAPPING = {
  math: {
    '二次函数': {
      animationType: 'quadratic',
      component: 'QuadraticFunctionAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/quadratic-function/1.3.0-phetio/phet-io/quadratic-function_all.html',
      phetSimId: 'quadratic-function',
      description: '二次函数图像与性质',
      defaultParams: { a: 1, b: -2, c: 3 }
    },
    '一次函数': {
      animationType: 'linear',
      component: 'FunctionGraphAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/graphing-lines/1.3.0-phetio/phet-io/graphing-lines_all.html',
      phetSimId: 'graphing-lines',
      description: '一次函数（直线）图像',
      defaultParams: { a: 1, b: 0 }
    },
    '反比例函数': {
      animationType: 'inverse',
      component: 'FunctionGraphAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/graphing-slope-intercept/1.0.0-phetio/phet-io/graphing-slope-intercept_all.html',
      phetSimId: 'graphing-slope-intercept',
      description: '反比例函数图像',
      defaultParams: { a: 1, b: 0 }
    },
    '三角函数': {
      animationType: 'trigonometric',
      component: 'FunctionGraphAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/trig-tour/1.0.0-phetio/phet-io/trig-tour_all.html',
      phetSimId: 'trig-tour',
      description: '三角函数图像',
      defaultParams: { a: 1, b: 1, c: 0, type: 'sin' }
    },
    '几何': {
      animationType: 'geometry',
      component: 'GeometryAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/area-model-algebra/1.0.0-phetio/phet-io/area-model-algebra_all.html',
      phetSimId: 'area-model-algebra',
      description: '几何图形',
      defaultParams: {}
    },
    '向量': {
      animationType: 'vector',
      component: 'VectorAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/vector-addition/1.0.0-phetio/phet-io/vector-addition_all.html',
      phetSimId: 'vector-addition',
      description: '向量运算',
      defaultParams: {}
    },
    '数列': {
      animationType: 'sequence',
      component: 'SequenceAnimation',
      phetSimUrl: null,
      description: '数列可视化',
      defaultParams: {}
    },
    '概率': {
      animationType: 'probability',
      component: 'ProbabilityAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/probability-plinko/1.0.0-phetio/phet-io/probability-plinko_all.html',
      phetSimId: 'probability-plinko',
      description: '概率实验',
      defaultParams: {}
    }
  },
  physics: {
    '自由落体': {
      animationType: 'freefall',
      component: 'FreeFallAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/falling-falling/1.0.0-phetio/phet-io/falling-falling_all.html',
      phetSimId: 'falling-falling',
      description: '自由落体运动',
      defaultParams: { height: 100, gravity: 9.8 }
    },
    '重力加速度': {
      animationType: 'freefall',
      component: 'FreeFallAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/falling-falling/1.0.0-phetio/phet-io/falling-falling_all.html',
      phetSimId: 'falling-falling',
      description: '重力加速度',
      defaultParams: { height: 100, gravity: 9.8 }
    },
    '力学': {
      animationType: 'mechanics',
      component: 'MechanicsAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/forces-and-motion-basics/2.1.0-phetio/phet-io/forces-and-motion-basics_all.html',
      phetSimId: 'forces-and-motion-basics',
      description: '力与运动',
      defaultParams: {}
    },
    '弹力': {
      animationType: 'spring',
      component: 'SpringAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/masses-and-springs/1.2.0-phetio/phet-io/masses-and-springs_all.html',
      phetSimId: 'masses-and-springs',
      description: '弹簧振子',
      defaultParams: {}
    },
    '电路': {
      animationType: 'circuit',
      component: 'CircuitAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/circuit-construction-kit-dc/1.4.0-phetio/phet-io/circuit-construction-kit-dc_all.html',
      phetSimId: 'circuit-construction-kit-dc',
      description: '电路实验',
      defaultParams: {}
    },
    '光学': {
      animationType: 'optics',
      component: 'OpticsAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/geometric-optics/1.2.0-phetio/phet-io/geometric-optics_all.html',
      phetSimId: 'geometric-optics',
      description: '几何光学',
      defaultParams: {}
    },
    '声波': {
      animationType: 'sound',
      component: 'SoundWaveAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/sound-waves/1.0.0-phetio/phet-io/sound-waves_all.html',
      phetSimId: 'sound-waves',
      description: '声波',
      defaultParams: {}
    }
  },
  chemistry: {
    '化学反应': {
      animationType: 'reaction',
      component: 'ReactionAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/reactions-and-rates/1.1.0-phetio/phet-io/reactions-and-rates_all.html',
      phetSimId: 'reactions-and-rates',
      description: '化学反应',
      defaultParams: { h2: 1, o2: 1 }
    },
    '燃烧反应': {
      animationType: 'combustion',
      component: 'ReactionAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/balancing-chemical-equations/1.1.0-phetio/phet-io/balancing-chemical-equations_all.html',
      phetSimId: 'balancing-chemical-equations',
      description: '燃烧反应',
      defaultParams: { h2: 1, o2: 1 }
    },
    '摩尔': {
      animationType: 'mole',
      component: 'MoleAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/balancing-chemical-equations/1.1.0-phetio/phet-io/balancing-chemical-equations_all.html',
      phetSimId: 'balancing-chemical-equations',
      description: '物质的量',
      defaultParams: {}
    },
    '酸碱': {
      animationType: 'acidbase',
      component: 'AcidBaseAnimation',
      phetSimUrl: 'https://phet.colorado.edu/html/acid-base-solutions/1.4.0-phetio/phet-io/acid-base-solutions_all.html',
      phetSimId: 'acid-base-solutions',
      description: '酸碱溶液',
      defaultParams: {}
    }
  }
}

export const findAnimationMapping = (knowledgePoints, subject) => {
  const subjectMappings = KNOWLEDGE_ANIMATION_MAPPING[subject] || {}
  
  for (const point of knowledgePoints) {
    for (const [key, mapping] of Object.entries(subjectMappings)) {
      if (point.includes(key) || key.includes(point)) {
        return {
          matchedPoint: key,
          ...mapping
        }
      }
    }
  }
  
  return null
}

export const getAnimationForProblem = (problem) => {
  const { knowledge_points, subject } = problem
  
  if (!knowledge_points || !subject) return null
  
  const mapping = findAnimationMapping(knowledge_points, subject)
  
  if (mapping) {
    return {
      ...mapping,
      problemData: {
        functionType: mapping.animationType,
        knowledgePoints: knowledge_points,
        initialParams: mapping.defaultParams
      }
    }
  }
  
  return {
    component: 'GenericAnimation',
    description: '通用动画',
    problemData: { knowledgePoints: knowledge_points }
  }
}
