import CustomMap from '../utils/map';
 
export async function storyMapper(story) {
  const placeName = await CustomMap.getPlaceNameByCoordinate(story.lat, story.lon);

  return {
    ...story,
    location: {
      latitude: story.lat,
      longitude: story.lon,
      placeName,
    },
  };
}
