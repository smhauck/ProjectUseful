class CreateProductStatusTypes < ActiveRecord::Migration
  def change
    create_table :product_status_types do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
