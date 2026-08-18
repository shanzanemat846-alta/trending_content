import styled from "styled-components";

export const StepperStyleWrapper = styled.div`
width: 100%;
.next-step{
  margin-top: 16px;
}
.date-range-picker .rdrCalendarWrapper.rdrDateRangeWrapper {
  width: 100%;
}
.threads-tabs {
    @media (min-width: 500px) {
      grid-gap: 8px;
      width: auto !important;
      display: flex !important;
      flex-wrap: wrap !important;
    }
    @media (max-width: 499px) {
      width: 350px !important;
      grid-gap: 8px;
      display: flex !important;
      flex-wrap: wrap !important;
    }
    @media (max-width: 359px) {
      width: 250px !important;
      grid-gap: 8px;
      display: flex !important;
      flex-wrap: wrap !important;
    }
}
  .stepper-box-wrapper {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    position: fixed;
    right: 0px;
    top: 35%;
    z-index: 11;
    width: ${({ isHovered }) => (isHovered ? "275px" : "60px")};
    padding: ${({ isHovered }) =>
    isHovered ? "20px 20px 20px 15px" : "20px 15px"};
    background: #ffffff;
    transition: width 0.2s ease;
    border: 1px solid #f5f5f5;
    @media (max-width: 420px) {
    width: ${({ isHovered }) => (isHovered ? "275px" : "40px")};
    padding: ${({ isHovered }) =>
    isHovered ? "20px 20px 20px 15px" : "8px"};
    }
  }
.label-text{
  font-size: 16px;
  font-weight: 400;
  line-height: 19.36px;
  text-align: left;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  color: #000000;

}
  .circle-box {
    min-width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  .content-body-wrapper{
    width: 100%;
    height: calc(100vh - 298px);
    overflow: auto;
    @media (max-width: 599px) {
      height: calc(100vh - 230px);

    }

header {
  display: flex;
  align-items: flex-start;
  grid-gap: 10px;
  p {
    margin: 0px;
}
.title-wrapper {
    display: flex;
    flex-direction: column;
    grid-row-gap: 10px;
    p {
    font-size: 20px;
    font-weight: 700;
    line-height: 24.2px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #000000;
    &:not(:first-child){
      font-size: 14px;
      font-weight: 400;
      line-height: 16.94px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #000000;
    }
}
}
}
}
.first-step--content-box{
  border: 1px solid #F5F5F5;
  background-color: #ffffff;
  box-shadow: 0px 14px 54px 0px #00000008;
  border-radius: 10px;
  width: 100%;
  @media (max-width: 899px) {
    padding: 8px;
  overflow: hidden;
  }
  @media (min-width: 900px) {
  padding: 24px;
  width: calc(100% - 24px);
  overflow: hidden;
  }
}
  footer{
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: end;
    grid-gap: 16px;
    margin-top: 24px;
  }
  .bag-wrapper{
    display: flex;
    align-items: center;
    grid-gap: 16px;
    margin-top: 24px;
    @media (max-width: 899px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 445px) {
      display: grid;
      grid-template-columns: 1fr;
    }
    .cards-item-wrapper {
    display: flex;
    max-width: 330px;
    width: 100%;
    cursor: pointer;
    justify-content: space-between;
    border:1px solid #EAEAEA;
    border-radius: 6px;
    padding: 17px 24px;
    &.active{
      border-color: #02A770;
      cursor:pointer;
    }
    &.disabled-btn {
      cursor: not-allowed !important;
  }
    &.disabled {
    user-select: none;
    cursor: not-allowed !important;
    pointer-events: none;
}
    .title {
    display: flex;
    align-items: center;
    grid-gap: 16px;
    p{
      font-size: 18px;
      font-weight: 400;
      line-height: 21.78px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      margin: 0;
      color: #000000;
    }
}
}
  }
  .tabs-wrapper {
    display: flex;
    align-items: center;
    grid-gap: 16px;
    margin-top: 24px;
    .tabs-one {
    display: flex;
    align-items: center;
    grid-gap: 16px;
    border: 1px solid #EAEAEA;
    padding: 17px 24px;
    border-radius: 8px;
    max-width: 330px;
    width: 100%;
    justify-content: center;
    cursor: pointer;
    @media (max-width: 899px) {
    max-width:160px;
    padding: 8px;
    }
    @media (max-width: 480px) {
      grid-gap: 4px;
      img{
        width: 20px;
      }
      p{
        font-size: 14px;
      }
    }
    &.disabled-card{
      cursor:not-allowed;
    }
    &.active{
      border-color: #02A770;
    }
    p {
    font-size: 18px;
    font-weight: 400;
    line-height: 21.78px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    margin: 0;
    color: #000000;
    @media (max-width: 480px) {
        font-size: 14px !important;
    }
}
}
}
.key-words-search-based h3 {
    font-size: 18px;
    font-weight: 700;
    line-height: 21.78px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    margin: 0px;
    margin-top: 24px;
    margin-bottom: 14px;
}
.checkbox-wrapper{
  display: flex;
  flex-direction: row;
  grid-gap: 16px;
  @media (max-width: 632px) {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap:12px;
    }
  @media (max-width: 480px) {
   display: grid;
   grid-template-columns: 1fr;
   gap:16px;
    }
  .checkbox-items{
    display: flex;
    grid-gap: 16px;
    cursor: pointer;

    p {
    margin: 0px;
    font-size: 16px;
    font-weight: 500;
    line-height: 19.36px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #000000;
}
  }
}
.sub-reddit-wrapper{
  display: flex;
  grid-gap: 16px;
  align-items: center;
  & > div {
    max-width: 300px;
    width: 100%;
  }
  button.remove-icon{
    width: 53px;
    margin-top: 38px;
  }
}
.sub-reddit-buttons-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 16px;

    }
}
.criteria-wrapper{
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 24px;
  grid-gap: 21px;
  &.criteria-wrapper.both-card{
    grid-template-columns: 1fr 1fr;
    @media (max-width: 899px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  .criteria-items {
    border: 1px solid #F5F5F5;
    border-radius: 6px;
    .header {
    padding: 24px;
    border-bottom: 1px solid #F5F5F5;
    display: flex;
    align-items: center;
    grid-gap: 8px;
    p {
    margin: 0px;
    font-size: 16px;
    font-weight: 700;
    line-height: 19.36px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #000000;
}
}
}
}
.content-wrapper{
  padding: 16px 24px 24px;
}
`;
