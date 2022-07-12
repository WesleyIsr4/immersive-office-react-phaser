import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
body {
  text-rendering: optimizeSpeed;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

#phaser-container {
  canvas {
    display: block;
  }
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 160px);
  grid-gap: 5px;
  grid-auto-rows: 160px;
  position: absolute;
  top: 35px;
  right: 10px;
  max-height: calc(100% - 100px);
  overflow-y: auto;
}

.video-grid video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  border: 1px groove rgb(229, 251, 255);
}

.button-grid {
  width: 160px;
  display: flex;
  justify-content: space-evenly;
  position: absolute;
  top: 5px;
  right: 10px;
}

* {
  &:hover {
    &::-webkit-scrollbar-thumb {
      background: #eee;
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(#333, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-corner {
    background: rgba(#333, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    transition: background 0.1s;
    background: rgba(#eee, 0.8);
    border-radius: 3px;
  }
}
`;

export default GlobalStyles;
