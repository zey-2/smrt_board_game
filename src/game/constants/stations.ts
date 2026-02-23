import type { StationTile } from "../types";

const STATIONS: Omit<StationTile, "ownerId">[] = [
  { id: "jurong-east", name: "Jurong East", line: "EWL", price: 280, baseRent: 28, group: "west-hub" },
  { id: "boon-lay", name: "Boon Lay", line: "EWL", price: 180, baseRent: 18, group: "west" },
  { id: "clementi", name: "Clementi", line: "EWL", price: 220, baseRent: 22, group: "west" },
  { id: "queenstown", name: "Queenstown", line: "EWL", price: 220, baseRent: 22, group: "city-fringe" },
  { id: "raffles-place", name: "Raffles Place", line: "EWL", price: 360, baseRent: 36, group: "core-cbd" },
  { id: "tampines", name: "Tampines", line: "EWL", price: 300, baseRent: 30, group: "east-hub" },
  { id: "pasir-ris", name: "Pasir Ris", line: "EWL", price: 200, baseRent: 20, group: "east" },
  { id: "woodlands", name: "Woodlands", line: "NSL", price: 320, baseRent: 32, group: "north-hub" },
  { id: "yishun", name: "Yishun", line: "NSL", price: 220, baseRent: 22, group: "north" },
  { id: "bishan", name: "Bishan", line: "NSL", price: 300, baseRent: 30, group: "central-hub" },
  { id: "orchard", name: "Orchard", line: "NSL", price: 340, baseRent: 34, group: "prime" },
  { id: "city-hall", name: "City Hall", line: "NSL", price: 360, baseRent: 36, group: "core-cbd" },
  { id: "marina-south-pier", name: "Marina South Pier", line: "NSL", price: 260, baseRent: 26, group: "south" },
  { id: "harbourfront", name: "HarbourFront", line: "CCL", price: 280, baseRent: 28, group: "harbour" },
  { id: "buona-vista", name: "Buona Vista", line: "CCL", price: 300, baseRent: 30, group: "tech-belt" },
  { id: "one-north", name: "one-north", line: "CCL", price: 240, baseRent: 24, group: "tech-belt" },
  { id: "serangoon", name: "Serangoon", line: "CCL", price: 280, baseRent: 28, group: "northeast-link" },
  { id: "stadium", name: "Stadium", line: "CCL", price: 220, baseRent: 22, group: "leisure" },
  { id: "caldecott", name: "Caldecott", line: "CCL", price: 260, baseRent: 26, group: "central-link" },
  { id: "maxwell", name: "Maxwell", line: "TEL", price: 260, baseRent: 26, group: "downtown" },
  { id: "shenton-way", name: "Shenton Way", line: "TEL", price: 300, baseRent: 30, group: "downtown" },
  { id: "stevens", name: "Stevens", line: "TEL", price: 260, baseRent: 26, group: "central-link" },
  { id: "woodlands-south", name: "Woodlands South", line: "TEL", price: 200, baseRent: 20, group: "north" },
  { id: "choa-chu-kang-lrt", name: "Choa Chu Kang LRT", line: "BPLRT", price: 160, baseRent: 16, group: "lrt" }
];

export const KEY_STATIONS_PRESET: StationTile[] = STATIONS.map((station) => ({
  ...station,
  ownerId: null
}));
