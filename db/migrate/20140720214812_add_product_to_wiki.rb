class AddProductToWiki < ActiveRecord::Migration
  def change
    add_reference :wikis, :product, index: true
  end
end
