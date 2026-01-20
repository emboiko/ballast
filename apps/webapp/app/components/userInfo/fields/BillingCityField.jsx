import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const BillingCityField = ({ value, onChange, isRequired, isDisabled }) => {
  return (
    <UserInfoField
      id="billing-city"
      label="City"
      value={value}
      onChange={onChange}
      placeholder="City"
      autoComplete="address-level2"
      maxLength={100}
      isRequired={isRequired}
      isDisabled={isDisabled}
    />
  )
}

export default BillingCityField
