import type { StationTile } from "../types";

const STATIONS: Omit<StationTile, "ownerId">[] = [
  { id: "jurong-east", name: "Jurong East", line: "EWL", price: 8, baseRent: 1, group: "west-hub" },
  { id: "boon-lay", name: "Boon Lay", line: "EWL", price: 5, baseRent: 1, group: "west" },
  { id: "clementi", name: "Clementi", line: "EWL", price: 6, baseRent: 1, group: "west" },
  { id: "queenstown", name: "Queenstown", line: "EWL", price: 6, baseRent: 1, group: "city-fringe" },
  { id: "raffles-place", name: "Raffles Place", line: "EWL", price: 10, baseRent: 1, group: "core-cbd" },
  { id: "tampines", name: "Tampines", line: "EWL", price: 8, baseRent: 1, group: "east-hub" },
  { id: "pasir-ris", name: "Pasir Ris", line: "EWL", price: 5, baseRent: 1, group: "east" },
  { id: "woodlands", name: "Woodlands", line: "NSL", price: 9, baseRent: 1, group: "north-hub" },
  { id: "yishun", name: "Yishun", line: "NSL", price: 6, baseRent: 1, group: "north" },
  { id: "bishan", name: "Bishan", line: "NSL", price: 8, baseRent: 1, group: "central-hub" },
  { id: "orchard", name: "Orchard", line: "NSL", price: 9, baseRent: 1, group: "prime" },
  { id: "dhoby-ghaut", name: "Dhoby Ghaut", line: "NSL", price: 9, baseRent: 1, group: "central-hub" },
  { id: "city-hall", name: "City Hall", line: "NSL", price: 10, baseRent: 1, group: "core-cbd" },
  { id: "marina-south-pier", name: "Marina South Pier", line: "NSL", price: 7, baseRent: 1, group: "south" },
  { id: "harbourfront", name: "HarbourFront", line: "CCL", price: 8, baseRent: 1, group: "harbour" },
  { id: "buona-vista", name: "Buona Vista", line: "CCL", price: 8, baseRent: 1, group: "tech-belt" },
  { id: "One-North", name: "One-North", line: "CCL", price: 6, baseRent: 1, group: "tech-belt" },
  { id: "serangoon", name: "Serangoon", line: "CCL", price: 8, baseRent: 1, group: "northeast-link" },
  { id: "stadium", name: "Stadium", line: "CCL", price: 6, baseRent: 1, group: "leisure" },
  { id: "caldecott", name: "Caldecott", line: "CCL", price: 7, baseRent: 1, group: "central-link" },
  { id: "maxwell", name: "Maxwell", line: "TEL", price: 7, baseRent: 1, group: "downtown" },
  { id: "shenton-way", name: "Shenton Way", line: "TEL", price: 8, baseRent: 1, group: "downtown" },
  { id: "stevens", name: "Stevens", line: "TEL", price: 7, baseRent: 1, group: "central-link" },
  { id: "woodlands-south", name: "Woodlands South", line: "TEL", price: 5, baseRent: 1, group: "north" },
  { id: "choa-chu-kang-lrt", name: "Choa Chu Kang LRT", line: "BPLRT", price: 4, baseRent: 1, group: "lrt" }
];

export const KEY_STATIONS_PRESET: StationTile[] = STATIONS.map((station) => ({
  ...station,
  ownerId: null
}));
