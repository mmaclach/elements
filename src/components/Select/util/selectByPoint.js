import sourceExists from '../../../util/sourceExists';
import layerExists from '../../../util/layerExists';
import selectStyles from '../util/selectStyles';

export default function selectByPoint(
  layers,
  point,
  map,
  existingSelection,
  setSelectedFeatures
) {
  var updateObj = {};
  for (let i = 0; i < layers.length; i++) {
    //get selected features for each active layer
    let selectedFeatures = map.queryRenderedFeatures(point, {
      layers: [layers[i]]
    });
    let newSelection = {};
    if (selectedFeatures.length > 0) {
      if (
        Object.keys(existingSelection).length === 0 &&
        existingSelection.constructor === Object
      ) {
        updateObj[layers[i]] = selectedFeatures;
        newSelection = { [layers[i]]: selectedFeatures };
      } else if (
        Object.keys(existingSelection).length > 0 &&
        existingSelection.constructor === Object
      ) {
        updateObj[layers[i]] = [
          ...existingSelection[layers[i]],
          ...selectedFeatures
        ];
        newSelection = {
          [layers[i]]: [...existingSelection[layers[i]], selectedFeatures[0]]
        };
      }

      let layerType = selectedFeatures[0].layer.type;
      const sourceName = `${layers[i]}-selected-src`;

      const src = sourceExists(map, sourceName);
      if (!src) {
        map.addSource(sourceName, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: selectedFeatures }
        });

        let paint;
        switch (layerType) {
          case 'fill':
            layerType = 'line';
            paint = selectStyles.line.paint;
            break;
          case 'line':
            paint = selectStyles.line.paint;
            break;
          case 'circle':
            paint = selectStyles.circle.paint;
            break;
          default:
            return null;
        }
        const lyr = layerExists(map, `${layers[i]}-selected`);
        if (!lyr) {
          map.addLayer({
            id: `${layers[i]}-selected`,
            type: layerType,
            source: sourceName,
            paint: paint
          });
        }
      } else {
        const lyr = layerExists(map, `${layers[i]}-selected`);
        if (!lyr) {
          map.addLayer({
            id: `${layers[i]}-selected`,
            type: layerType,
            source: sourceName,
            paint: paint
          });
        }
        map.getSource(sourceName).setData({
          type: 'FeatureCollection',
          features: newSelection[layers[i]]
        });
      }
    }
  }
  setSelectedFeatures(updateObj);
}
