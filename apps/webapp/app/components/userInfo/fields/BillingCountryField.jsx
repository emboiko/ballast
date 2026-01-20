import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const BillingCountryField = ({ value, onChange, isRequired, isDisabled }) => {
  return (
    <UserInfoField
      id="billing-country"
      label="Country"
      value={value}
      onChange={onChange}
      placeholder="US"
      autoComplete="country"
      maxLength={2}
      isRequired={isRequired}
      isDisabled={isDisabled}
    />
  )
}

export default BillingCountryField
