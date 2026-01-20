import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const PhoneNumberField = ({
  value,
  onChange,
  isRequired,
  isDisabled,
  tooltipText,
}) => {
  return (
    <UserInfoField
      id="user-phone-number"
      label="Phone number"
      value={value}
      onChange={onChange}
      placeholder="(555) 123-4567"
      autoComplete="tel"
      inputMode="tel"
      maxLength={14}
      isRequired={isRequired}
      isDisabled={isDisabled}
      tooltipText={tooltipText}
      span={1}
    />
  )
}

export default PhoneNumberField
