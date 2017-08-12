class AddPublicToProduct < ActiveRecord::Migration[4.2]
  def change
    add_column :products, :public, :boolean, null: false, default: false
  end
end
