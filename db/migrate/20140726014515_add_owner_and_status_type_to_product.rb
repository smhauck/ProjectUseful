class AddOwnerAndStatusTypeToProduct < ActiveRecord::Migration[4.2]
  def change
    add_column :products, :owner_id, :integer, null: false, default: 1
    add_column :products, :product_status_type_id, :integer, null: false, default: 1

    reversible do |dir|
      dir.up { Product.update_all owner_id: 1 }
    end
    reversible do |dir|
      dir.up { Product.update_all product_status_type_id: 1 }
    end
  end
end
