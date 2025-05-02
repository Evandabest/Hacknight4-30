export interface SubwayLineData {
  id: string;
  color: string;
  textColor: string;
}

// NYC Subway lines data with official MTA colors
export const subwayLinesData: SubwayLineData[] = [
  { id: '1', color: '#EE352E', textColor: 'white' },
  { id: '2', color: '#EE352E', textColor: 'white' },
  { id: '3', color: '#EE352E', textColor: 'white' },
  { id: '4', color: '#00933C', textColor: 'white' },
  { id: '5', color: '#00933C', textColor: 'white' },
  { id: '6', color: '#00933C', textColor: 'white' },
  { id: '7', color: '#B933AD', textColor: 'white' },
  { id: 'A', color: '#0039A6', textColor: 'white' },
  { id: 'C', color: '#0039A6', textColor: 'white' },
  { id: 'E', color: '#0039A6', textColor: 'white' },
  { id: 'B', color: '#FF6319', textColor: 'white' },
  { id: 'D', color: '#FF6319', textColor: 'white' },
  { id: 'F', color: '#FF6319', textColor: 'white' },
  { id: 'M', color: '#FF6319', textColor: 'white' },
  { id: 'G', color: '#6CBE45', textColor: 'white' },
  { id: 'J', color: '#996633', textColor: 'white' },
  { id: 'Z', color: '#996633', textColor: 'white' },
  { id: 'L', color: '#A7A9AC', textColor: 'white' },
  { id: 'N', color: '#FCCC0A', textColor: 'black' },
  { id: 'Q', color: '#FCCC0A', textColor: 'black' },
  { id: 'R', color: '#FCCC0A', textColor: 'black' },
  { id: 'W', color: '#FCCC0A', textColor: 'black' },
  { id: 'S', color: '#808183', textColor: 'white' },
];

// Get subway line data by ID
export function getSubwayLineData(lineId: string): SubwayLineData | undefined {
  return subwayLinesData.find(line => line.id === lineId);
}

// Get all subway line IDs
export function getAllSubwayLineIds(): string[] {
  return subwayLinesData.map(line => line.id);
}