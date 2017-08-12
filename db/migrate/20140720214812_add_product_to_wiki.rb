class AddProductToWiki < ActiveRecord::Migration[4.2]
  def change
    add_reference :wikis, :product, index: true
  end
end
