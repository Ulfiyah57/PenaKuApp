export default class camera {
  #stream;
  #isStreaming = false;
  #videoWidth = 640;
  #videoHeight = 0;

  #video;
  #cameraSelector;
  #canvas;

  #snapshotButton;

  static storeStreamGlobally(stream) {
    if (!Array.isArray(window.globalCameraStreams)) {
      window.globalCameraStreams = [stream];
    } else {
      window.globalCameraStreams.push(stream);
    }
  }

  static stopAllActiveStreams(videoElement) {
    const stream = videoElement.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }

  constructor({ video, cameraSelect, canvas }) {
    this.#video = video;
    this.#cameraSelector = cameraSelect;
    this.#canvas = canvas;

    this.#setupInitialListeners();

    window.addEventListener('beforeunload', () => {
      this.stopAllActiveStreams();
    });
  }

  #setupInitialListeners() {
    this.#video.oncanplay = () => {
      if (this.#isStreaming) return;

      this.#videoHeight = (this.#video.videoHeight * this.#videoWidth) / this.#video.videoWidth;
      this.#canvas.setAttribute('width', this.#videoWidth);
      this.#canvas.setAttribute('height', this.#videoHeight);

      this.#isStreaming = true;
    };

    this.#cameraSelector.onchange = async () => {
      this.stopAllActiveStreams();
      await this.startCamera();
    };
  }

  async #updateCameraOptions(stream) {
    if (!(stream instanceof MediaStream)) {
      return Promise.reject(Error('Tidak ada MediaStream!'));
    }

    try {
      const currentDeviceId = stream.getVideoTracks()[0].getSettings().deviceId;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');

      this.#cameraSelector.innerHTML = videoDevices
        .map(
          (device, index) => `
          <option value="${device.deviceId}" ${device.deviceId === currentDeviceId ? 'selected' : ''}>
            ${device.label || `Camera ${index + 1}`}
          </option>
        `,
        )
        .join('');
    } catch (err) {
      console.error('#updateCameraOptions: error:', err);
    }
  }

  async #requestCameraStream() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia tidak didukung di browser ini.');
      }

      const selectedDeviceId = this.#cameraSelector.value;
      const constraints = {
        video: {
          aspectRatio: 4 / 3,
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.#updateCameraOptions(stream);
      return stream;
    } catch (err) {
      console.error('#requestCameraStream: error:', err);
      return null;
    }
  }

  async startCamera() {
    this.#stream = await this.#requestCameraStream();

    if (this.#stream) {
      camera.storeStreamGlobally(this.#stream);

      this.#video.srcObject = this.#stream;
      this.#video.play();

      this.#resetCanvas();
    }
  }

  stopAllActiveStreams() {
    if (this.#video) {
      this.#video.srcObject = null;
      this.#isStreaming = false;
    }

    if (this.#stream instanceof MediaStream) {
      this.#stream.getTracks().forEach((track) => track.stop());
    }

    this.#resetCanvas();
  }

  #resetCanvas() {
    const ctx = this.#canvas.getContext('2d');
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  async captureImage() {
    if (!(this.#videoWidth && this.#videoHeight)) {
      return null;
    }

    const ctx = this.#canvas.getContext('2d');
    this.#canvas.width = this.#videoWidth;
    this.#canvas.height = this.#videoHeight;

    ctx.drawImage(this.#video, 0, 0, this.#videoWidth, this.#videoHeight);

    return new Promise((resolve) => {
      this.#canvas.toBlob((blob) => resolve(blob));
    });
  }

  onSnapshotButtonClick(selector, handler) {
    this.#snapshotButton = document.querySelector(selector);
    if (this.#snapshotButton) {
      this.#snapshotButton.onclick = handler;
    }
  }
}
