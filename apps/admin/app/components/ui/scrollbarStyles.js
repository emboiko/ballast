import { css } from "styled-components"

export const scrollbarStyles = ({
  trackColor = "transparent",
  thumbColor = "var(--border-color)",
  hoverColor = "var(--text-secondary)",
} = {}) => {
  return css`
    scrollbar-width: thin;
    scrollbar-color: ${thumbColor} ${trackColor};

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      background: ${trackColor};
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${thumbColor};
      border-radius: 999px;
      border: 3px solid transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: ${hoverColor};
    }
  `
}
