import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const BillingAddressLine1Field = ({
  value,
  onChange,
  isRequired,
  isDisabled,
}) => {
  return (
    <UserInfoField
      id="billing-address-line1"
      label="Address line 1"
      value={value}
      onChange={onChange}
      placeholder="Street address"
      autoComplete="address-line1"
      maxLength={200}
      isRequired={isRequired}
      isDisabled={isDisabled}
      span={2}
    />
  )
}

export default BillingAddressLine1Field
