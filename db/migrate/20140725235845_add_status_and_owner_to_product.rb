class AddStatusAndOwnerToProduct < ActiveRecord::Migration
  def change
    add_column :product_status_types, :code, :string, null: false, default: 'FIXME'
    add_reference :products, :product_status_type, index: true, null: false, default: 1
    add_column :products, :owner_id, :integer, null: false, default: 1
  end
end
