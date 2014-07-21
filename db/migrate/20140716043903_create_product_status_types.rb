class CreateProductStatusTypes < ActiveRecord::Migration
  def change
    create_table :product_status_types do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end

    ProductStatusType.create(title: "Waiting", alive: "1")
    ProductStatusType.create(title: "In Progress", alive: "1")
    ProductStatusType.create(title: "Complete", alive: "0")

  end
end
