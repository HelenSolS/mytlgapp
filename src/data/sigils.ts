export interface Sigil {
  id: string
  name: string
  nameEn: string
  description: string
  elements: string[]
  symbol: string
}

export const SIGILS: Sigil[] = [
  { id: '1', name: 'Шёпот', nameEn: 'Whisper', description: 'Сила тайного слова', elements: ['Воздух'], symbol: '◇' },
  { id: '2', name: 'Врата Ветров', nameEn: 'Wind Gates', description: 'Открытие путей', elements: ['Воздух'], symbol: '✦' },
  { id: '3', name: 'Танец Волн', nameEn: 'Wave Dance', description: 'Текучесть и гибкость', elements: ['Вода'], symbol: '∿' },
  { id: '4', name: 'Глубина', nameEn: 'Depth', description: 'Притяжение к истинам', elements: ['Вода', 'Эфир'], symbol: '⊙' },
  { id: '5', name: 'Пламя Первозданное', nameEn: 'Primordial Flame', description: 'Трансформация и сила', elements: ['Огонь'], symbol: '◈' },
  { id: '6', name: 'Корни Земли', nameEn: 'Earth Roots', description: 'Заземление и устойчивость', elements: ['Земля'], symbol: '▲' },
  { id: '7', name: 'Эфирное Плетение', nameEn: 'Ether Weave', description: 'Связь всех миров', elements: ['Эфир'], symbol: '※' },
  { id: '8', name: 'Синтез Четырёх', nameEn: 'Four Synthesis', description: 'Баланс элементов', elements: ['Воздух', 'Вода', 'Огонь', 'Земля'], symbol: '⬢' },
]

export const ELEMENTS = {
  'Воздух': '#60A5FA',
  'Вода': '#06B6D4',
  'Огонь': '#F97316',
  'Земля': '#84CC16',
  'Эфир': '#A78BFA',
  'Плетение': '#EC4899'
}

export const STYLES = [
  { id: 'comic', name: 'Comic', description: 'Полутоновый комический стиль' },
  { id: 'ink', name: 'Ink', description: 'Классическая тушь' },
  { id: 'convex', name: 'Convex 3D', description: 'Объёмный выпуклый стиль' },
  { id: 'kawaii', name: 'Kawaii', description: 'Милый и округлый' }
]

export const ELEMENT_TYPES = Object.keys(ELEMENTS)
