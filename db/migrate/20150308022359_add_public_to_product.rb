class AddPublicToProduct < ActiveRecord::Migration
  def change
    add_column :products, :public, :boolean, null: false, default: false
  end
end
