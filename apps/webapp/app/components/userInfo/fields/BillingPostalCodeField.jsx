import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const BillingPostalCodeField = ({
  value,
  onChange,
  isRequired,
  isDisabled,
}) => {
  return (
    <UserInfoField
      id="billing-postal-code"
      label="Postal code"
      value={value}
      onChange={onChange}
      placeholder="ZIP / Postal code"
      autoComplete="postal-code"
      maxLength={20}
      isRequired={isRequired}
      isDisabled={isDisabled}
    />
  )
}

export default BillingPostalCodeField
