# Awesome Viewer
## Live demo
[Awesome-viewer](https://blog.voezy.com/awesome-viewer/)

## Install
```
npm i -S @voezy-kit/awesome-viewer
```

## Usage
### Initialize
```javascript
import "@voezy-kit/awesome-viewer/dist/bundle.css";
import { ImgViewer } from "@voezy-kit/awesome-viewer";

const imgViewer = new ImgViewer({
  imgList: [
    {
      // This is the source location of your image
      src: 'https://via.placeholder.com/4000x2000',
      // And you can put some introduction in it
      desc: 'An image of 4000X2000 pixels',
    }
  ],
});
```
### Visibility
```javascript
// Show image viewer
imgViewer.show();
// Hide image viewer
imgViewer.hide();
```

### Update
```javascript
imgViewer.updateState({
  imgList: [
    {
      src: 'https://via.placeholder.com/1000x2000',
      desc: 'An image of 1000X2000 pixels',
    }
  ],
})
```

### Destroy
```javascript
imgViewer.destroy();
```

## License
[MIT](http://opensource.org/licenses/MIT)
