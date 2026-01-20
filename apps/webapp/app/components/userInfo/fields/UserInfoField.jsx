import { FormGroup } from "@/components/ui/uiStyles"
import {
  LabelRow,
  RequiredIndicator,
  TooltipIcon,
  TooltipText,
  TooltipWrapper,
  UserInfoFieldWrapper,
} from "@/components/userInfo/userInfoStyles"

const UserInfoField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  isRequired,
  isDisabled,
  span,
  tooltipText,
}) => {
  let tooltipId = null
  if (tooltipText) {
    tooltipId = `${id}-tooltip`
  }

  return (
    <UserInfoFieldWrapper $span={span}>
      <FormGroup>
        <LabelRow>
          <label htmlFor={id}>
            {label}
            {isRequired && <RequiredIndicator>*</RequiredIndicator>}
          </label>
          {tooltipText && (
            <TooltipWrapper>
              <TooltipIcon
                type="button"
                aria-label={`Why is ${label} required?`}
                aria-describedby={tooltipId}
              >
                ?
              </TooltipIcon>
              <TooltipText id={tooltipId}>{tooltipText}</TooltipText>
            </TooltipWrapper>
          )}
        </LabelRow>
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          required={isRequired}
          disabled={isDisabled}
        />
      </FormGroup>
    </UserInfoFieldWrapper>
  )
}

export default UserInfoField
