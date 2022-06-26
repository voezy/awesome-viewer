interface LimitParams {
  imgWidth: number;
  imgHeight: number;
  zoneWidth: number;
  zoneHeight: number;
}

function limitWidth(options: LimitParams, defaultMargin: number) {
  const {
    imgWidth,
    imgHeight,
    zoneWidth,
  } = options;
  const basicWidth = zoneWidth - defaultMargin * 2;
  const basicHeight = basicWidth * (imgHeight / imgWidth);
  return {
    basicWidth,
    basicHeight,
  };
}

function limitHeight(options: LimitParams, defaultMargin: number) {
  const {
    imgWidth,
    imgHeight,
    zoneHeight,
  } = options;
  const basicHeight = zoneHeight - defaultMargin * 2;
  const basicWidth = basicHeight * (imgWidth / imgHeight);
  return {
    basicWidth,
    basicHeight,
  };
}

export function getBasicSize(options: LimitParams) {
  const {
    imgWidth,
    imgHeight,
    zoneWidth,
    zoneHeight,
  } = options;
  const defaultMargin = zoneWidth * 0.1;
  const wider = imgWidth >= zoneWidth;
  const higher = imgHeight >= zoneHeight;
  let basicSize = {
    basicWidth: 0,
    basicHeight: 0,
  };

  if (wider && !higher) {
    basicSize = limitWidth(options, defaultMargin);
  } else if (!wider && higher) {
    basicSize = limitHeight(options, defaultMargin);
  } else if (wider && higher) {
    const rate = (imgWidth / zoneWidth) / (imgHeight / zoneHeight);
    if (rate >= 1) {
      basicSize = limitWidth(options, defaultMargin);
    } else {
      basicSize = limitHeight(options, defaultMargin);
    }
  } else {
    basicSize.basicWidth = imgWidth;
    basicSize.basicHeight = imgHeight;
  }
  return basicSize;
}
