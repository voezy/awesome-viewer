import { ImgViewer } from '../dist/index.mjs';
import '../dist/bundle.css';

let imgViewer = null

main()

function getImgElArr() {
  return Array.from(document.querySelectorAll('.img-list img') || []);
}

function main() {
  const imgElArr = getImgElArr()
  const imgOptions = []
  imgElArr.forEach((imgEl) => {
    imgEl.addEventListener('click', onClickImg)
    imgOptions.push({
      src: imgEl.src,
      desc: `Photo by ${imgEl.dataset.by}, ${imgEl.dataset.site}`
    })
  })
  imgViewer = new ImgViewer({
    imgList: imgOptions,
  });
}

function onClickImg(e) {
  const imgElArr = getImgElArr()
  const index = imgElArr.findIndex((imgEl) => imgEl === e.target)
  index > -1 && imgViewer.show(index)
}
